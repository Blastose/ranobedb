import type Person from '$lib/models/person';
import { supabaseServerClient } from '@supabase/auth-helpers-sveltekit';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals }) => {
	const { data, error, status } = await supabaseServerClient(locals.accessToken)
		.from<Person>('person')
		.select('*');

	if (error) {
		console.error(error);
		return { status };
	}

	return {
		status,
		body: { people: data }
	};
};
