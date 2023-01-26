import type { PageServerLoad, Actions } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import { createRedirectUrl } from '$lib/util/createRedirectUrl';
import { db } from '$lib/server/lucia';
import marked from '$lib/marked/marked';
import DOMPurify from 'isomorphic-dompurify';
import { editPublisherSchema, joinErrors } from '$lib/zod/schemas';
import { sql } from 'kysely';
import type { PublisherRelType } from '$lib/types/dbTypes';
import pkg from 'pg';
const { DatabaseError } = pkg;

export const load = (async ({ locals, url, params }) => {
	const session = await locals.validate();
	if (!session) {
		throw redirect(303, createRedirectUrl('login', url));
	}

	const id = Number(params.id);
	const publisher = await db
		.selectFrom('publisher')
		.selectAll('publisher')
		.select(
			sql<{ id: number; name: string; type: PublisherRelType }[]>`
			COALESCE(
				JSONB_AGG(
					JSONB_BUILD_OBJECT(
						'id', publisher_child.id,
						'name', publisher_child.name,
						'type', publisher_rel.type
					)
				) FILTER (WHERE publisher_child.id IS NOT NULL),
				'[]'::JSONB
			)
		`.as('publisher_rels')
		)
		.leftJoin('publisher_rel', 'publisher_rel.id_parent', 'publisher.id')
		.leftJoin('publisher as publisher_child', 'publisher_rel.id_child', 'publisher_child.id')
		.groupBy('publisher.id')
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
		const { session, user } = await locals.validateUser();
		if (!session) {
			return fail(400, {
				error: { message: 'Insufficient permission. Unable to edit.' }
			} as EditPublisherErrorType);
		}
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

		console.log(parsedForm.data.publisher_rel);

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

				await trx.deleteFrom('publisher_rel').where('publisher_rel.id_parent', '=', id).execute();

				// Using a for let instead of forEach since catching any throws
				// does not work properly in the callback to the forEach
				for (let i = 0; i < parsedForm.data.publisher_rel.length; i++) {
					await trx
						.insertInto('publisher_rel')
						.values({
							id_parent: id,
							id_child: parsedForm.data.publisher_rel[i].id,
							type: parsedForm.data.publisher_rel[i].type
						})
						.execute();
				}
			});
		} catch (e) {
			if (e instanceof DatabaseError) {
				if (e.code === '23505' && e.table === 'publisher_rel') {
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
