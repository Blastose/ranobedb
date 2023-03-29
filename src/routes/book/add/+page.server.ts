import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { createRedirectUrl } from '$lib/util/createRedirectUrl';
import { db } from '$lib/server/db';
import marked from '$lib/marked/marked';
import DOMPurify from 'isomorphic-dompurify';
import { editBookSchema, joinErrors } from '$lib/zod/schemas';
import pkg from 'pg';
const { DatabaseError } = pkg;

export const load = (async ({ locals, url }) => {
	const session = await locals.auth.validate();
	if (!session) {
		throw redirect(303, createRedirectUrl('login', url));
	}
	return {};
}) satisfies PageServerLoad;

type AddBookErrorType = {
	titleError?: { message: string };
	titleRomajiError?: { message: string };
	description?: { message: string };
	volumeError?: { message: string };
	duplicatePersonsError?: { message: string };
	error?: { message: string };
};

export const actions = {
	default: async ({ request, locals }) => {
		const { session, user } = await locals.auth.validateUser();
		if (!session) {
			return fail(400, {
				error: { message: 'Insufficient permission. Unable to add.' }
			} as AddBookErrorType);
		}
		if (user.role !== 'admin') {
			return fail(400, {
				error: { message: 'Insufficient permission. Unable to add.' }
			} as AddBookErrorType);
		}

		const form = await request.formData();

		const parsedForm = editBookSchema.safeParse(form);
		if (!parsedForm.success) {
			const flattenedErrors = parsedForm.error.flatten();
			return fail(400, {
				titleError: { message: joinErrors(flattenedErrors.fieldErrors.title) },
				titleRomajiError: { message: joinErrors(flattenedErrors.fieldErrors.titleRomaji) },
				description: { message: joinErrors(flattenedErrors.fieldErrors.description) },
				volumeError: { message: joinErrors(flattenedErrors.fieldErrors.volume) },
				error: { message: 'Invalid form entries. Unable to edit!' }
			} as AddBookErrorType);
		}

		const description = DOMPurify.sanitize(marked.parse(parsedForm.data.description));
		let addedBookId = -1;

		try {
			await db.transaction().execute(async (trx) => {
				const returnedBook = await trx
					.insertInto('book')
					.values({
						title: parsedForm.data.title,
						title_romaji: parsedForm.data.titleRomaji || null,
						description: description || null,
						description_markdown: parsedForm.data.description || null,
						volume: parsedForm.data.volume
					})
					.returning('book.id')
					.executeTakeFirstOrThrow();

				addedBookId = returnedBook.id;

				const personRelInsert = parsedForm.data.person.map((item) => {
					return { book_id: addedBookId, person_id: item.id, role: item.role };
				});
				if (personRelInsert.length > 0) {
					await trx.insertInto('person_book_rel').values(personRelInsert).execute();
				}
			});
		} catch (e) {
			if (e instanceof DatabaseError) {
				console.log(e);
				if (e.code === '23505' && e.table === 'person_book_rel') {
					return fail(400, {
						error: { message: 'Invalid form entries. Unable to add!' },
						duplicatePersonsError: {
							message: 'Duplicate people with same roles in form. Remove duplicates and try again.'
						}
					} as AddBookErrorType);
				}
			}
			return fail(400, {
				error: { message: 'Invalid form entries. Unable to add!' }
			} as AddBookErrorType);
		}
		return { success: true, addedBookId };
	}
} satisfies Actions;
