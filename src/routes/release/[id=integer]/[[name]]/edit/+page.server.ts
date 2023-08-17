import type { PageServerLoad, Actions } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import { createRedirectUrl } from '$lib/util/createRedirectUrl';
import { db, jsonb_agg } from '$lib/server/db';
import { editReleaseSchema, joinErrors } from '$lib/zod/schemas';
import pkg from 'pg';
const { DatabaseError } = pkg;

export const load = (async ({ locals, url, params }) => {
	const session = await locals.auth.validate();
	if (!session) {
		throw redirect(303, createRedirectUrl('login', url));
	}

	const id = Number(params.id);

	const release = await db
		.selectFrom('release')
		.selectAll('release')
		.select([
			(qb) =>
				jsonb_agg(
					qb
						.selectFrom('publisher')
						.innerJoin('publisher_release', 'publisher_release.publisher_id', 'publisher.id')
						.select(['publisher.id', 'publisher.name'])
						.whereRef('publisher_release.release_id', '=', 'release.id')
				).as('publishers'),
			(qb) =>
				jsonb_agg(
					qb
						.selectFrom('book')
						.innerJoin('book_release', 'book_release.book_id', 'book.id')
						.select(['book.id', 'book.title as name'])
						.whereRef('book_release.release_id', '=', 'release.id')
				).as('books')
		])
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
		const session = await locals.auth.validate();
		if (!session) {
			return fail(400, {
				error: { message: 'Insufficient permission. Unable to edit.' }
			} as EditReleaseErrorType);
		}
		const user = session.user;
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
				await trx.deleteFrom('book_release').where('book_release.release_id', '=', id).execute();
				const bookRelInsert = parsedForm.data.bookRel.map((item) => {
					return { book_id: item.id, release_id: id };
				});
				if (bookRelInsert.length > 0) {
					await trx.insertInto('book_release').values(bookRelInsert).execute();
				}

				// Update release-publisher relations
				await trx
					.deleteFrom('publisher_release')
					.where('publisher_release.release_id', '=', id)
					.execute();
				const publisherRelInsert = parsedForm.data.publisherRel.map((item) => {
					return { publisher_id: item.id, release_id: id };
				});
				if (publisherRelInsert.length > 0) {
					await trx.insertInto('publisher_release').values(publisherRelInsert).execute();
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
					} as EditReleaseErrorType);
				} else if (e.code === '23505' && e.table === 'book_release') {
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
