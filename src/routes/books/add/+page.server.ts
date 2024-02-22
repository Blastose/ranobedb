import { addBook } from '$lib/server/db/books/actions';
import { bookSchema } from '$lib/zod/schema.js';
import { fail, redirect } from '@sveltejs/kit';
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async ({ locals }) => {
	if (!locals.user) redirect(302, '/');

	const form = await superValidate(
		{
			titles: [
				{
					lang: 'ja',
					official: true,
					title: '',
					romaji: ''
				}
			]
		},
		zod(bookSchema)
	);

	return { form };
};

export const actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) redirect(302, '/');
		if (locals.user.role === 'user') fail(403);

		const form = await superValidate(request, zod(bookSchema), { errors: false });

		if (!form.valid) {
			return fail(400, { form });
		}

		console.log(form.data);

		try {
			await addBook({ book: form.data }, locals.user);
		} catch (e) {
			console.log(e);
		}

		return message(form, { text: 'Valid form', type: 'success' });
	}
};
