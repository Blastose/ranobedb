import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { createRedirectUrl } from '$lib/util/createRedirectUrl';
import { db } from '$lib/server/db';
import { editSeriesSchema, joinErrors } from '$lib/zod/schemas';
import pkg from 'pg';
const { DatabaseError } = pkg;

export const load = (async ({ locals, url }) => {
	const session = await locals.auth.validate();
	if (!session) {
		throw redirect(303, createRedirectUrl('login', url));
	}

	return {};
}) satisfies PageServerLoad;

type AddSeriesErrorType = {
	titleError?: { message: string };
	titleRomajiError?: { message: string };
	duplicateBooksError?: { message: string };
	error?: { message: string };
};

export const actions = {
	default: async ({ request, locals }) => {
		const { session, user } = await locals.auth.validateUser();
		if (!session) {
			return fail(400, {
				error: { message: 'Insufficient permission. Unable to add.' }
			} as AddSeriesErrorType);
		}
		if (user.role !== 'admin') {
			return fail(400, {
				error: { message: 'Insufficient permission. Unable to add.' }
			} as AddSeriesErrorType);
		}

		const form = await request.formData();

		const parsedForm = editSeriesSchema.safeParse(form);
		if (!parsedForm.success) {
			const flattenedErrors = parsedForm.error.flatten();
			return fail(400, {
				titleError: { message: joinErrors(flattenedErrors.fieldErrors.title) },
				titleRomajiError: { message: joinErrors(flattenedErrors.fieldErrors.titleRomaji) },
				error: { message: 'Invalid form entries. Unable to add!' }
			} as AddSeriesErrorType);
		}

		let addedSeriesId = -1;
		try {
			await db.transaction().execute(async (trx) => {
				const returnedSeries = await trx
					.insertInto('book_series')
					.values({
						title: parsedForm.data.title,
						title_romaji: parsedForm.data.titleRomaji || null
					})
					.returning('book_series.id')
					.executeTakeFirstOrThrow();

				addedSeriesId = returnedSeries.id;
				const bookRelInsert = parsedForm.data.booksInSeries.map((item) => {
					return { series_id: addedSeriesId, book_id: item.id };
				});
				if (bookRelInsert.length > 0) {
					await trx.insertInto('part_of').values(bookRelInsert).execute();
				}
			});
		} catch (e) {
			if (e instanceof DatabaseError) {
				if (e.code === '23505' && e.table === 'part_of') {
					return fail(400, {
						error: { message: 'Invalid form entries. Unable to add!' },
						duplicateBooksError: {
							message: 'Duplicate books in form. Remove duplicates and try again.'
						}
					} as AddSeriesErrorType);
				}
			}

			return fail(400, {
				error: { message: 'Invalid form entries. Unable to add!' }
			} as AddSeriesErrorType);
		}

		return { success: true, addedSeriesId };
	}
} satisfies Actions;
