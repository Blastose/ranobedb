import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { createRedirectUrl } from '$lib/util/createRedirectUrl';
import { db } from '$lib/server/db';
import marked from '$lib/marked/marked';
import DOMPurify from 'isomorphic-dompurify';
import { editPersonSchema, joinErrors } from '$lib/zod/schemas';

export const load = (async ({ locals, url }) => {
	const session = await locals.auth.validate();
	if (!session) {
		throw redirect(303, createRedirectUrl('login', url));
	}

	return {};
}) satisfies PageServerLoad;

type AddPersonErrorType = {
	error?: { message: string };
	nameError?: { message: string };
	nameRomajiError?: { message: string };
	descriptionError?: { message: string };
};

export const actions = {
	default: async ({ request, locals }) => {
		const session = await locals.auth.validate();
		if (!session) {
			return fail(400, {
				error: { message: 'Insufficient permission. Unable to add.' }
			} as AddPersonErrorType);
		}
		const user = session.user;
		if (user.role !== 'admin') {
			return fail(400, {
				error: { message: 'Insufficient permission. Unable to add.' }
			} as AddPersonErrorType);
		}

		const form = await request.formData();

		const parsedForm = editPersonSchema.safeParse(form);
		if (!parsedForm.success) {
			const flattenedErrors = parsedForm.error.flatten();
			return fail(400, {
				nameError: { message: joinErrors(flattenedErrors.fieldErrors.name) },
				nameRomajiError: { message: joinErrors(flattenedErrors.fieldErrors.nameRomaji) },
				descriptionError: { message: joinErrors(flattenedErrors.fieldErrors.description) },
				error: { message: 'Invalid form entries. Unable to add!' }
			} as AddPersonErrorType);
		}
		const description = DOMPurify.sanitize(marked.parse(parsedForm.data.description));
		let addedPersonId = -1;

		try {
			await db.transaction().execute(async (trx) => {
				const returnedPerson = await trx
					.insertInto('person')
					.values({
						name: parsedForm.data.name,
						name_romaji: parsedForm.data.nameRomaji || null,
						description: description || null,
						description_markdown: parsedForm.data.description || null
					})
					.returning('person.id')
					.executeTakeFirstOrThrow();

				addedPersonId = returnedPerson.id;
			});
		} catch (e) {
			return fail(400, {
				error: { message: 'Invalid form entries. Unable to add!' }
			} as AddPersonErrorType);
		}

		return { success: true, addedPersonId };
	}
} satisfies Actions;
