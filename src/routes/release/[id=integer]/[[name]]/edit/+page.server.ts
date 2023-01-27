import type { PageServerLoad, Actions } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import { createRedirectUrl } from '$lib/util/createRedirectUrl';
import { db } from '$lib/server/lucia';
import { editReleaseSchema, joinErrors } from '$lib/zod/schemas';
import { sql } from 'kysely';
import pkg from 'pg';
const { DatabaseError } = pkg;

export const load = (async ({ locals, url, params }) => {
	const session = await locals.validate();
	if (!session) {
		throw redirect(303, createRedirectUrl('login', url));
	}

	const id = Number(params.id);
	const release = await db
		.selectFrom('release')
		.leftJoin('publisher_release_rel', 'publisher_release_rel.release_id', 'release.id')
		.leftJoin('publisher', 'publisher.id', 'publisher_release_rel.publisher_id')
		.leftJoin('book_release_rel', 'book_release_rel.release_id', 'release.id')
		.leftJoin('book', 'book.id', 'book_release_rel.book_id')
		.selectAll('release')
		.select(
			sql<{ id: number; name: string }[]>`
			COALESCE(
				JSONB_AGG(
					DISTINCT JSONB_BUILD_OBJECT(			
						'id', publisher.id,	
						'name', publisher.name
					)
				) FILTER (WHERE publisher.id IS NOT NULL),
				'[]'::JSONB
			)`.as('publishers')
		)
		.select(
			sql<{ id: number; name: string }[]>`
			COALESCE(
				JSONB_AGG(
					DISTINCT JSONB_BUILD_OBJECT(
						'id', book.id,
						'name', book.title
					)
				) FILTER (WHERE book.id IS NOT NULL),
				'[]'::JSONB
			)`.as('books')
		)
		.groupBy('release.id')
		.where('release.id', '=', id)
		.executeTakeFirst();

	if (!release) {
		throw error(404);
	}

	return { release };
}) satisfies PageServerLoad;

type EditReleaseErrorType = {
	error?: { message: string };
	nameError?: { message: string };
	nameRomajiError?: { message: string };
	isbn13Error?: { message: string };
	descriptionError?: { message: string };
	duplicatePublisherError?: { message: string };
	duplicateBookError?: { message: string };
	invalidReleaseDate?: { message: string };
};

export const actions = {
	default: async ({ request, params, locals }) => {
		const { session, user } = await locals.validateUser();
		if (!session) {
			return fail(400, {
				error: { message: 'Insufficient permission. Unable to edit.' }
			} as EditReleaseErrorType);
		}
		if (user.role !== 'admin') {
			return fail(400, {
				error: { message: 'Insufficient permission. Unable to edit.' }
			} as EditReleaseErrorType);
		}

		const id = Number(params.id);
		const form = await request.formData();

		const parsedForm = editReleaseSchema.safeParse(form);
		if (!parsedForm.success) {
			const flattenedErrors = parsedForm.error.flatten();
			return fail(400, {
				nameError: { message: joinErrors(flattenedErrors.fieldErrors.name) },
				nameRomajiError: { message: joinErrors(flattenedErrors.fieldErrors.nameRomaji) },
				isbn13Error: { message: joinErrors(flattenedErrors.fieldErrors.isbn13) },
				descriptionError: { message: joinErrors(flattenedErrors.fieldErrors.description) },
				error: { message: 'Invalid form entries. Unable to edit!' }
			} as EditReleaseErrorType);
		}

		try {
			await db.transaction().execute(async (trx) => {
				// Update release
				await trx
					.updateTable('release')
					.set({
						name: parsedForm.data.name,
						name_romaji: parsedForm.data.nameRomaji || null,
						format: parsedForm.data.format || null,
						lang: parsedForm.data.lang || null,
						description: parsedForm.data.description || null,
						release_date: parsedForm.data.releaseDate || null,
						isbn13: parsedForm.data.isbn13 || null
					})
					.where('id', '=', id)
					.executeTakeFirstOrThrow();

				// Update release-book relations
				await trx
					.deleteFrom('book_release_rel')
					.where('book_release_rel.release_id', '=', id)
					.execute();
				const bookRelInsert = parsedForm.data.bookRel.map((item) => {
					return { book_id: item.id, release_id: id };
				});
				await trx.insertInto('book_release_rel').values(bookRelInsert).execute();

				// Update release-publisher relations
				await trx
					.deleteFrom('publisher_release_rel')
					.where('publisher_release_rel.release_id', '=', id)
					.execute();
				const publisherRelInsert = parsedForm.data.publisherRel.map((item) => {
					return { publisher_id: item.id, release_id: id };
				});
				await trx.insertInto('publisher_release_rel').values(publisherRelInsert).execute();
			});
		} catch (e) {
			if (e instanceof DatabaseError) {
				if (e.code === '23505' && e.table === 'publisher_rel') {
					return fail(400, {
						error: { message: 'Invalid form entries. Unable to edit!' },
						duplicatePublisherError: {
							message: 'Duplicate publishers in form. Remove duplicates and try again.'
						}
					} as EditReleaseErrorType);
				} else if (e.code === '23505' && e.table === 'book_release_rel') {
					return fail(400, {
						error: { message: 'Invalid form entries. Unable to edit!' },
						duplicateBookError: {
							message: 'Duplicate books in form. Remove duplicates and try again.'
						}
					} as EditReleaseErrorType);
				} else if (e.code === '22008' && e.routine === 'DateTimeParseError') {
					return fail(400, {
						error: { message: 'Invalid form entries. Unable to edit!' },
						invalidReleaseDate: {
							message: 'Release date is invalid.'
						}
					} as EditReleaseErrorType);
				}
			}

			return fail(400, {
				error: { message: 'Invalid form entries. Unable to edit!' }
			} as EditReleaseErrorType);
		}

		return { success: true };
	}
} satisfies Actions;
