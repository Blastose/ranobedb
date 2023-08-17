import type { PageServerLoad, Actions } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import { createRedirectUrl } from '$lib/util/createRedirectUrl';
import { db } from '$lib/server/db';
import marked from '$lib/marked/marked';
import DOMPurify from 'isomorphic-dompurify';
import { editPersonSchema, joinErrors } from '$lib/zod/schemas';

export const load = (async ({ locals, url, params }) => {
	const session = await locals.auth.validate();
	if (!session) {
		throw redirect(303, createRedirectUrl('login', url));
	}

	const id = Number(params.id);
	const person = await db.selectFrom('person').selectAll().where('id', '=', id).executeTakeFirst();

	if (!person) {
		throw error(404);
	}

	return { person };
}) satisfies PageServerLoad;

type EditPersonErrorType = {
	error?: { message: string };
	nameError?: { message: string };
	nameRomajiError?: { message: string };
	descriptionError?: { message: string };
};

export const actions = {
	default: async ({ request, params, locals }) => {
		const session = await locals.auth.validate();
		if (!session) {
			return fail(400, {
				error: { message: 'Insufficient permission. Unable to edit.' }
			} as EditPersonErrorType);
		}
		const user = session.user;
		if (user.role !== 'admin') {
			return fail(400, {
				error: { message: 'Insufficient permission. Unable to edit.' }
			} as EditPersonErrorType);
		}

		const id = Number(params.id);
		const form = await request.formData();

		const parsedForm = editPersonSchema.safeParse(form);
		if (!parsedForm.success) {
			const flattenedErrors = parsedForm.error.flatten();
			return fail(400, {
				nameError: { message: joinErrors(flattenedErrors.fieldErrors.name) },
				nameRomajiError: { message: joinErrors(flattenedErrors.fieldErrors.nameRomaji) },
				descriptionError: { message: joinErrors(flattenedErrors.fieldErrors.description) },
				error: { message: 'Invalid form entries. Unable to edit!' }
			} as EditPersonErrorType);
		}
		const description = DOMPurify.sanitize(marked.parse(parsedForm.data.description));

		try {
			await db.transaction().execute(async (trx) => {
				await trx
					.updateTable('person')
					.set({
						name: parsedForm.data.name,
						name_romaji: parsedForm.data.nameRomaji || null,
						description: description || null,
						description_markdown: parsedForm.data.description || null
					})
					.where('id', '=', id)
					.executeTakeFirstOrThrow();
			});
		} catch (e) {
			return fail(400, {
				error: { message: 'Invalid form entries. Unable to edit!' }
			} as EditPersonErrorType);
		}

		return { success: true };
	}
} satisfies Actions;
