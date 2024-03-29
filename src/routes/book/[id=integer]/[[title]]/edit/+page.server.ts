import type { PageServerLoad, Actions } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import { createRedirectUrl } from '$lib/util/createRedirectUrl';
import { db } from '$lib/server/db';
import { jsonArrayFrom } from 'kysely/helpers/postgres';
import marked from '$lib/marked/marked';
import DOMPurify from 'isomorphic-dompurify';
import { editBookSchema, joinErrors } from '$lib/zod/schemas';
import pkg from 'pg';
const { DatabaseError } = pkg;

export const load = (async ({ locals, url, params }) => {
	const session = await locals.auth.validate();
	if (!session) {
		throw redirect(303, createRedirectUrl('login', url));
	}

	const id = Number(params.id);
	const book = await db
		.selectFrom('book')
		.selectAll('book')
		.select((eb) => [
			jsonArrayFrom(
				eb
					.selectFrom('person')
					.leftJoin('person_book', 'person_book.person_id', 'person.id')
					.select(['person.id', 'person.name', 'person_book.role'])
					.select('person_book.role')
					.whereRef('person_book.book_id', '=', 'book.id')
			).as('people')
		])
		.where('id', '=', id)
		.groupBy('book.id')
		.executeTakeFirst();

	if (!book) {
		throw error(404);
	}

	return { book };
}) satisfies PageServerLoad;

type EditBookErrorType = {
	titleError?: { message: string };
	titleRomajiError?: { message: string };
	description?: { message: string };
	volumeError?: { message: string };
	duplicatePersonsError?: { message: string };
	error?: { message: string };
};

export const actions = {
	default: async ({ request, params, locals }) => {
		const session = await locals.auth.validate();
		if (!session) {
			return fail(400, {
				error: { message: 'Insufficient permission. Unable to edit.' }
			} as EditBookErrorType);
		}
		const user = session.user;
		if (user.role !== 'admin') {
			return fail(400, {
				error: { message: 'Insufficient permission. Unable to edit.' }
			} as EditBookErrorType);
		}

		const id = Number(params.id);
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
			} as EditBookErrorType);
		}

		const description = DOMPurify.sanitize(marked.parse(parsedForm.data.description));

		try {
			await db.transaction().execute(async (trx) => {
				await trx
					.updateTable('book')
					.set({
						title: parsedForm.data.title,
						title_romaji: parsedForm.data.titleRomaji || null,
						description: description || null,
						description_markdown: parsedForm.data.description || null,
						volume: parsedForm.data.volume
					})
					.where('id', '=', id)
					.executeTakeFirstOrThrow();

				await trx.deleteFrom('person_book').where('book_id', '=', id).execute();
				const personRelInsert = parsedForm.data.person.map((item) => {
					return { book_id: id, person_id: item.id, role: item.role };
				});
				if (personRelInsert.length > 0) {
					await trx.insertInto('person_book').values(personRelInsert).execute();
				}
			});
		} catch (e) {
			if (e instanceof DatabaseError) {
				console.log(e);
				if (e.code === '23505' && e.table === 'person_book') {
					return fail(400, {
						error: { message: 'Invalid form entries. Unable to edit!' },
						duplicatePersonsError: {
							message: 'Duplicate people with same roles in form. Remove duplicates and try again.'
						}
					} as EditBookErrorType);
				}
			}
			return fail(400, {
				error: { message: 'Invalid form entries. Unable to edit!' }
			} as EditBookErrorType);
		}
		return { success: true };
	}
} satisfies Actions;
