import { addBook } from '$lib/server/db/books/actions';
import { bookSchema } from '$lib/zod/schema.js';
import { fail, redirect } from '@sveltejs/kit';
import { message, setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import pkg from 'pg';
const { DatabaseError } = pkg;

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
		zod(bookSchema),
		{ errors: false }
	);

	return { form };
};

export const actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) redirect(302, '/');
		if (locals.user.role === 'user') return fail(403);

		const form = await superValidate(request, zod(bookSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		console.log(form.data);

		try {
			await addBook({ book: form.data }, locals.user);
		} catch (e) {
			if (e instanceof DatabaseError) {
				if (
					e.code === '23505' &&
					e.table === 'book_staff_alias' &&
					e.constraint === 'book_staff_alias_pkey'
				) {
					return setError(
						form,
						'staff._errors',
						'Duplicate staff member with same roles in form. Remove duplicates and try again.'
					);
				}
			}
		}

		return message(form, { text: 'Valid form', type: 'success' });
	}
};
