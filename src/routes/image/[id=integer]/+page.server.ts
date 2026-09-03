import { db } from '$lib/server/db/db.js';
import { hasEditPerms } from '$lib/db/permissions.js';
import { imageContentsSchema } from '$lib/server/zod/schema.js';
import { error, fail } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

export const load = async ({ params }) => {
	const id = Number(params.id);

	const image = await db
		.selectFrom('image')
		.where('image.id', '=', id)
		.selectAll()
		.executeTakeFirst();

	if (!image) {
		error(404);
	}

	const books = await db
		.selectFrom('book')
		.where('book.image_id', '=', id)
		.select(['book.id', 'book.hidden'])
		.execute();

	const form = await superValidate({ nsfw: image.nsfw }, zod4(imageContentsSchema));

	return {
		image,
		books,
		form,
	};
};

export const actions = {
	default: async ({ request, locals, params }) => {
		if (!locals.user) {
			return fail(401);
		}
		if (!hasEditPerms(locals.user)) {
			return fail(403);
		}

		const id = Number(params.id);
		const form = await superValidate(request, zod4(imageContentsSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const image = await db
			.selectFrom('image')
			.where('image.id', '=', id)
			.select('image.id')
			.executeTakeFirst();

		if (!image) return fail(404);

		await db
			.updateTable('image')
			.set({ nsfw: form.data.nsfw })
			.where('image.id', '=', id)
			.execute();

		return message(form, { text: 'Image updated!', type: 'success' });
	},
};
