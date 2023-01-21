import type { PageServerLoad, Actions } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import { createRedirectUrl } from '$lib/util/createRedirectUrl';
import { db } from '$lib/server/lucia';
import marked from '$lib/marked/marked';
import DOMPurify from 'isomorphic-dompurify';

export const load: PageServerLoad = async ({ locals, url, params }) => {
	const session = await locals.validate();
	if (!session) {
		throw redirect(303, createRedirectUrl('login', url));
	}

	const id = Number(params.id);
	const book = await db.selectFrom('book').selectAll().where('id', '=', id).executeTakeFirst();
	if (!book) {
		throw error(404);
	}

	return { book };
};

export const actions: Actions = {
	default: async ({ request, params, locals }) => {
		const { session, user } = await locals.validateUser();

		const id = Number(params.id);
		const form = await request.formData();

		const title = String(form.get('title'));
		const titleRomaji = String(form.get('titleRomaji'));
		const descriptionMD = String(form.get('description'));
		const volume = String(form.get('volume'));

		console.log(Object.fromEntries(form));
		const description = DOMPurify.sanitize(marked.parse(descriptionMD));

		try {
			await db
				.updateTable('book')
				.set({
					title: title,
					title_romaji: titleRomaji,
					description: description,
					description_markdown: descriptionMD,
					volume: volume
				})
				.where('id', '=', id)
				.executeTakeFirstOrThrow();
		} catch (e) {
			console.log(e);
			return fail(400, { error: true });
		}

		return { success: true };
	}
};
