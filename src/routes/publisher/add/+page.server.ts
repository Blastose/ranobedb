import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { createRedirectUrl } from '$lib/util/createRedirectUrl';
import { db } from '$lib/server/db';
import marked from '$lib/marked/marked';
import DOMPurify from 'isomorphic-dompurify';
import { editPublisherSchema, joinErrors } from '$lib/zod/schemas';
import pkg from 'pg';
const { DatabaseError } = pkg;

export const load = (async ({ locals, url }) => {
	const session = await locals.validate();
	if (!session) {
		throw redirect(303, createRedirectUrl('login', url));
	}

	return {};
}) satisfies PageServerLoad;

type AddPublisherErrorType = {
	error?: { message: string };
	nameError?: { message: string };
	nameRomajiError?: { message: string };
	descriptionError?: { message: string };
	duplicatePublisherError?: { message: string };
};

export const actions = {
	default: async ({ request, locals }) => {
		const { session, user } = await locals.validateUser();
		if (!session) {
			return fail(400, {
				error: { message: 'Insufficient permission. Unable to add.' }
			} as AddPublisherErrorType);
		}
		if (user.role !== 'admin') {
			return fail(400, {
				error: { message: 'Insufficient permission. Unable to add.' }
			} as AddPublisherErrorType);
		}

		const form = await request.formData();

		const parsedForm = editPublisherSchema.safeParse(form);
		if (!parsedForm.success) {
			const flattenedErrors = parsedForm.error.flatten();
			return fail(400, {
				nameError: { message: joinErrors(flattenedErrors.fieldErrors.name) },
				nameRomajiError: { message: joinErrors(flattenedErrors.fieldErrors.nameRomaji) },
				descriptionError: { message: joinErrors(flattenedErrors.fieldErrors.description) },
				error: { message: 'Invalid form entries. Unable to add!' }
			} as AddPublisherErrorType);
		}
		const description = DOMPurify.sanitize(marked.parse(parsedForm.data.description));
		let addedPublisherId = -1;

		try {
			await db.transaction().execute(async (trx) => {
				const addedPublisher = await trx
					.insertInto('publisher')
					.values({
						name: parsedForm.data.name,
						name_romaji: parsedForm.data.nameRomaji || null,
						description: description || null,
						description_markdown: parsedForm.data.description
					})
					.returning('publisher.id')
					.executeTakeFirstOrThrow();

				addedPublisherId = addedPublisher.id;
				const publisherRelInsert = parsedForm.data.publisherRel.map((item) => {
					return { id_parent: addedPublisherId, id_child: item.id, type: item.type };
				});
				if (publisherRelInsert.length > 0) {
					await trx.insertInto('publisher_rel').values(publisherRelInsert).execute();
				}
			});
		} catch (e) {
			if (e instanceof DatabaseError) {
				if (e.code === '23505' && e.table === 'publisher_rel') {
					return fail(400, {
						error: { message: 'Invalid form entries. Unable to add!' },
						duplicatePublisherError: {
							message: 'Duplicate publishers in form. Remove duplicates and try again.'
						}
					} as AddPublisherErrorType);
				}
			}

			return fail(400, {
				error: { message: 'Invalid form entries. Unable to add!' }
			} as AddPublisherErrorType);
		}

		return { success: true, addedPublisherId };
	}
} satisfies Actions;
