import type { PageServerLoad, Actions } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import { createRedirectUrl } from '$lib/util/createRedirectUrl';
import { db } from '$lib/server/db';
import { jsonArrayFrom } from 'kysely/helpers/postgres';
import marked from '$lib/marked/marked';
import DOMPurify from 'isomorphic-dompurify';
import { editPublisherSchema, joinErrors } from '$lib/zod/schemas';
import pkg from 'pg';
const { DatabaseError } = pkg;

export const load = (async ({ locals, url, params }) => {
	const session = await locals.auth.validate();
	if (!session) {
		throw redirect(303, createRedirectUrl('login', url));
	}

	const id = Number(params.id);
	const publisher = await db
		.selectFrom('publisher')
		.selectAll('publisher')
		.select((eb) => [
			jsonArrayFrom(
				eb
					.selectFrom('publisher as publisher_child')
					.innerJoin('publisher_relation', 'publisher_relation.id_child', 'publisher_child.id')
					.select(['publisher_child.id', 'publisher_child.name', 'publisher_relation.type'])
					.distinct()
					.whereRef('publisher_relation.id_parent', '=', 'publisher.id')
			).as('publisher_rels')
		])
		.where('publisher.id', '=', id)
		.executeTakeFirst();

	if (!publisher) {
		throw error(404);
	}
	return { publisher };
}) satisfies PageServerLoad;

type EditPublisherErrorType = {
	error?: { message: string };
	nameError?: { message: string };
	nameRomajiError?: { message: string };
	descriptionError?: { message: string };
	duplicatePublisherError?: { message: string };
};

export const actions = {
	default: async ({ request, params, locals }) => {
		const session = await locals.auth.validate();
		if (!session) {
			return fail(400, {
				error: { message: 'Insufficient permission. Unable to edit.' }
			} as EditPublisherErrorType);
		}
		const user = session.user;
		if (user.role !== 'admin') {
			return fail(400, {
				error: { message: 'Insufficient permission. Unable to edit.' }
			} as EditPublisherErrorType);
		}

		const id = Number(params.id);
		const form = await request.formData();

		const parsedForm = editPublisherSchema.safeParse(form);
		if (!parsedForm.success) {
			const flattenedErrors = parsedForm.error.flatten();
			return fail(400, {
				nameError: { message: joinErrors(flattenedErrors.fieldErrors.name) },
				nameRomajiError: { message: joinErrors(flattenedErrors.fieldErrors.nameRomaji) },
				descriptionError: { message: joinErrors(flattenedErrors.fieldErrors.description) },
				error: { message: 'Invalid form entries. Unable to edit!' }
			} as EditPublisherErrorType);
		}
		const description = DOMPurify.sanitize(marked.parse(parsedForm.data.description));

		try {
			await db.transaction().execute(async (trx) => {
				await trx
					.updateTable('publisher')
					.set({
						name: parsedForm.data.name,
						name_romaji: parsedForm.data.nameRomaji || null,
						description: description || null,
						description_markdown: parsedForm.data.description
					})
					.where('id', '=', id)
					.executeTakeFirstOrThrow();

				await trx
					.deleteFrom('publisher_relation')
					.where('publisher_relation.id_parent', '=', id)
					.execute();
				const publisherRelInsert = parsedForm.data.publisherRel.map((item) => {
					return { id_parent: id, id_child: item.id, type: item.type };
				});
				if (publisherRelInsert.length > 0) {
					await trx.insertInto('publisher_relation').values(publisherRelInsert).execute();
				}
			});
		} catch (e) {
			if (e instanceof DatabaseError) {
				if (e.code === '23505' && e.table === 'publisher_relation') {
					return fail(400, {
						error: { message: 'Invalid form entries. Unable to edit!' },
						duplicatePublisherError: {
							message: 'Duplicate publishers in form. Remove duplicates and try again.'
						}
					} as EditPublisherErrorType);
				}
			}

			return fail(400, {
				error: { message: 'Invalid form entries. Unable to edit!' }
			} as EditPublisherErrorType);
		}

		return { success: true };
	}
} satisfies Actions;
