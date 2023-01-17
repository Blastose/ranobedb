import type { PageServerLoad, Actions } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import { createRedirectUrl } from '$lib/util/createRedirectUrl';
import { db } from '$lib/server/lucia';

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
	default: async ({ request, params }) => {
		const id = Number(params.id);
		const form = await request.formData();

		const title = String(form.get('title'));
		const titleRomaji = String(form.get('titleRomaji'));
		const description = String(form.get('description'));

		try {
			await db
				.updateTable('book')
				.set({
					title: title,
					title_romaji: titleRomaji
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
