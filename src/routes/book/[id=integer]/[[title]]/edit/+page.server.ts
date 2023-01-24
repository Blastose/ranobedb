import type { PageServerLoad, Actions } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import { createRedirectUrl } from '$lib/util/createRedirectUrl';
import { db } from '$lib/server/lucia';
import marked from '$lib/marked/marked';
import DOMPurify from 'isomorphic-dompurify';
import { sql } from 'kysely';
import { editBookSchema, joinErrors } from '$lib/zod/schemas';
import pkg from 'pg';
const { DatabaseError } = pkg;

export const load = (async ({ locals, url, params }) => {
	const session = await locals.validate();
	if (!session) {
		throw redirect(303, createRedirectUrl('login', url));
	}

	const id = Number(params.id);
	const book = await db
		.selectFrom('book')
		.selectAll('book')
		.select(
			sql<{ id: number; name: string; role: string }[]>`
			COALESCE(
				JSONB_AGG(
					DISTINCT JSONB_BUILD_OBJECT(
						'name', person.person_name,
						'id', person.person_id,
						'role', person_book_rel.role
					)
				) FILTER (WHERE person.person_name IS NOT NULL),
				'[]'::JSONB
			)
		`.as('people')
		)
		.leftJoin('person_book_rel', 'book.id', 'person_book_rel.book_id')
		.leftJoin('person', 'person_book_rel.person_id', 'person.person_id')
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
		const { session, user } = await locals.validateUser();
		if (!session) {
			return fail(400, {
				error: { message: 'Insufficient permission. Unable to edit.' }
			} as EditBookErrorType);
		}
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
						title_romaji: parsedForm.data.titleRomaji,
						description: description,
						description_markdown: parsedForm.data.description,
						volume: parsedForm.data.volume
					})
					.where('id', '=', id)
					.executeTakeFirstOrThrow();

				await trx.deleteFrom('person_book_rel').where('book_id', '=', id).execute();

				// Using a for let instead of forEach since catching any throws
				// does not work properly in the callback to the forEach
				for (let i = 0; i < parsedForm.data.person.length; i++) {
					await trx
						.insertInto('person_book_rel')
						.values({
							book_id: id,
							person_id: parsedForm.data.person[i].id,
							role: parsedForm.data.person[i].role
						})
						.execute();
				}
			});
		} catch (e) {
			if (e instanceof DatabaseError) {
				if (e.code === '23505' && e.table === 'person_book_rel') {
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
