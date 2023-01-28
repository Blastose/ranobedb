import type { PageServerLoad, Actions } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import { createRedirectUrl } from '$lib/util/createRedirectUrl';
import { db } from '$lib/server/lucia';
import { editSeriesSchema, joinErrors } from '$lib/zod/schemas';
import { sql } from 'kysely';
import pkg from 'pg';
const { DatabaseError } = pkg;

export const load = (async ({ locals, url, params }) => {
	const session = await locals.validate();
	if (!session) {
		throw redirect(303, createRedirectUrl('login', url));
	}

	const id = Number(params.id);
	const series = await db
		.selectFrom('book_series')
		.selectAll('book_series')
		.select(
			sql<{ id: number; name: string }[]>`
			COALESCE(
				JSONB_AGG(
					JSONB_BUILD_OBJECT(
						'id', book_info.id,
						'name', book_info.title
					) ORDER BY book_info.release_date
				) FILTER (WHERE book_info.id IS NOT NULL),
				'[]'::JSONB
			)
		`.as('books_in_series')
		)
		.leftJoin('part_of', 'part_of.series_id', 'book_series.id')
		.leftJoin('book_info', 'book_info.id', 'part_of.book_id')
		.where('book_series.id', '=', id)
		.groupBy('book_series.id')
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
		const { session, user } = await locals.validateUser();
		if (!session) {
			return fail(400, {
				error: { message: 'Insufficient permission. Unable to edit.' }
			} as EditSeriesErrorType);
		}
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
					.updateTable('book_series')
					.set({
						title: parsedForm.data.title,
						title_romaji: parsedForm.data.titleRomaji || null
					})
					.where('id', '=', id)
					.executeTakeFirstOrThrow();

				await trx.deleteFrom('part_of').where('part_of.series_id', '=', id).execute();
				const bookRelInsert = parsedForm.data.booksInSeries.map((item) => {
					return { series_id: id, book_id: item.id };
				});
				if (bookRelInsert.length > 0) {
					await trx.insertInto('part_of').values(bookRelInsert).execute();
				}
			});
		} catch (e) {
			if (e instanceof DatabaseError) {
				if (e.code === '23505' && e.table === 'part_of') {
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
