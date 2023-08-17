import type { PageServerLoad, Actions } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import { createRedirectUrl } from '$lib/util/createRedirectUrl';
import { db } from '$lib/server/db';
import { jsonArrayFrom } from 'kysely/helpers/postgres';
import { editSeriesSchema, joinErrors } from '$lib/zod/schemas';
import pkg from 'pg';
const { DatabaseError } = pkg;

export const load = (async ({ locals, url, params }) => {
	const session = await locals.auth.validate();
	if (!session) {
		throw redirect(303, createRedirectUrl('login', url));
	}

	const id = Number(params.id);
	const series = await db
		.selectFrom('series')
		.selectAll('series')
		.select((eb) => [
			jsonArrayFrom(
				eb
					.selectFrom('book_info')
					.innerJoin('book_series', 'book_series.book_id', 'book_info.id')
					.select(['book_info.id', 'book_info.title as name'])
					.whereRef('book_series.series_id', '=', 'series.id')
					.orderBy('book_info.release_date')
			).as('books')
		])
		.where('series.id', '=', id)
		.executeTakeFirst();

	if (!series) {
		throw error(404);
	}
	return { series };
}) satisfies PageServerLoad;

type EditSeriesErrorType = {
	titleError?: { message: string };
	titleRomajiError?: { message: string };
	duplicateBooksError?: { message: string };
	error?: { message: string };
};

export const actions = {
	default: async ({ request, params, locals }) => {
		const session = await locals.auth.validate();
		if (!session) {
			return fail(400, {
				error: { message: 'Insufficient permission. Unable to edit.' }
			} as EditSeriesErrorType);
		}
		const user = session.user;
		if (user.role !== 'admin') {
			return fail(400, {
				error: { message: 'Insufficient permission. Unable to edit.' }
			} as EditSeriesErrorType);
		}

		const id = Number(params.id);
		const form = await request.formData();

		const parsedForm = editSeriesSchema.safeParse(form);
		if (!parsedForm.success) {
			const flattenedErrors = parsedForm.error.flatten();
			return fail(400, {
				titleError: { message: joinErrors(flattenedErrors.fieldErrors.title) },
				titleRomajiError: { message: joinErrors(flattenedErrors.fieldErrors.titleRomaji) },
				error: { message: 'Invalid form entries. Unable to edit!' }
			} as EditSeriesErrorType);
		}

		try {
			await db.transaction().execute(async (trx) => {
				await trx
					.updateTable('series')
					.set({
						title: parsedForm.data.title,
						title_romaji: parsedForm.data.titleRomaji || null
					})
					.where('id', '=', id)
					.executeTakeFirstOrThrow();

				await trx.deleteFrom('book_series').where('book_series.series_id', '=', id).execute();
				const bookRelInsert = parsedForm.data.booksInSeries.map((item) => {
					return { series_id: id, book_id: item.id };
				});
				if (bookRelInsert.length > 0) {
					await trx.insertInto('book_series').values(bookRelInsert).execute();
				}
			});
		} catch (e) {
			if (e instanceof DatabaseError) {
				if (e.code === '23505' && e.table === 'book_series') {
					return fail(400, {
						error: { message: 'Invalid form entries. Unable to edit!' },
						duplicateBooksError: {
							message: 'Duplicate books in form. Remove duplicates and try again.'
						}
					} as EditSeriesErrorType);
				}
			}

			return fail(400, {
				error: { message: 'Invalid form entries. Unable to edit!' }
			} as EditSeriesErrorType);
		}

		return { success: true };
	}
} satisfies Actions;
