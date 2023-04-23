import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { createRedirectUrl } from '$lib/util/createRedirectUrl';
import { db } from '$lib/server/db';
import { editReleaseSchema, joinErrors } from '$lib/zod/schemas';
import pkg from 'pg';
const { DatabaseError } = pkg;

export const load = (async ({ locals, url }) => {
	const session = await locals.auth.validate();
	if (!session) {
		throw redirect(303, createRedirectUrl('login', url));
	}

	return {};
}) satisfies PageServerLoad;

type AddReleaseErrorType = {
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
	default: async ({ request, locals }) => {
		const { session, user } = await locals.auth.validateUser();
		if (!session) {
			return fail(400, {
				error: { message: 'Insufficient permission. Unable to add.' }
			} as AddReleaseErrorType);
		}
		if (user.role !== 'admin') {
			return fail(400, {
				error: { message: 'Insufficient permission. Unable to add.' }
			} as AddReleaseErrorType);
		}

		const form = await request.formData();

		const parsedForm = editReleaseSchema.safeParse(form);
		if (!parsedForm.success) {
			const flattenedErrors = parsedForm.error.flatten();
			console.log(flattenedErrors);
			return fail(400, {
				nameError: { message: joinErrors(flattenedErrors.fieldErrors.name) },
				nameRomajiError: { message: joinErrors(flattenedErrors.fieldErrors.nameRomaji) },
				isbn13Error: { message: joinErrors(flattenedErrors.fieldErrors.isbn13) },
				descriptionError: { message: joinErrors(flattenedErrors.fieldErrors.description) },
				error: { message: 'Invalid form entries. Unable to add!' }
			} as AddReleaseErrorType);
		}

		let addedReleaseId = -1;
		try {
			await db.transaction().execute(async (trx) => {
				const returnedRelease = await trx
					.insertInto('release')
					.values({
						name: parsedForm.data.name,
						name_romaji: parsedForm.data.nameRomaji || null,
						format: parsedForm.data.format || null,
						lang: parsedForm.data.lang || null,
						description: parsedForm.data.description || null,
						release_date: parsedForm.data.releaseDate || null,
						isbn13: parsedForm.data.isbn13 || null
					})
					.returning('release.id')
					.executeTakeFirstOrThrow();
				addedReleaseId = returnedRelease.id;

				// Add release-book relations
				const bookRelInsert = parsedForm.data.bookRel.map((item) => {
					return { book_id: item.id, release_id: addedReleaseId };
				});
				if (bookRelInsert.length > 0) {
					await trx.insertInto('book_release').values(bookRelInsert).execute();
				}

				// Add release-publisher relations
				const publisherRelInsert = parsedForm.data.publisherRel.map((item) => {
					return { publisher_id: item.id, release_id: addedReleaseId };
				});
				if (publisherRelInsert.length > 0) {
					await trx.insertInto('publisher_release').values(publisherRelInsert).execute();
				}
			});
		} catch (e) {
			if (e instanceof DatabaseError) {
				if (e.code === '23505' && e.table === 'publisher_relation') {
					return fail(400, {
						error: { message: 'Invalid form entries. Unable to add!' },
						duplicatePublisherError: {
							message: 'Duplicate publishers in form. Remove duplicates and try again.'
						}
					} as AddReleaseErrorType);
				} else if (e.code === '23505' && e.table === 'book_release') {
					return fail(400, {
						error: { message: 'Invalid form entries. Unable to add!' },
						duplicateBookError: {
							message: 'Duplicate books in form. Remove duplicates and try again.'
						}
					} as AddReleaseErrorType);
				} else if (e.code === '22008' && e.routine === 'DateTimeParseError') {
					return fail(400, {
						error: { message: 'Invalid form entries. Unable to add!' },
						invalidReleaseDate: {
							message: 'Release date is invalid.'
						}
					} as AddReleaseErrorType);
				}
			}

			return fail(400, {
				error: { message: 'Invalid form entries. Unable to add!' }
			} as AddReleaseErrorType);
		}

		return { success: true, addedReleaseId };
	}
} satisfies Actions;
