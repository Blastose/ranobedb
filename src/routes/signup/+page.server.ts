import { signupSchema } from '$lib/zod/schema';
import { redirect } from '@sveltejs/kit';
import { message, superValidate } from 'sveltekit-superforms/server';

export const load = async ({ locals }) => {
	const session = await locals.auth.validate();
	if (session) {
		throw redirect(303, '');
	}

	const form = await superValidate(signupSchema);

	return { form };
};

export const actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, signupSchema);

		if (!form.valid) {
			return message(form, 'Invalid form');
		}

		return message(form, 'Valid form!');
	}
};
