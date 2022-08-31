import type Person from '$lib/models/person';
import { supabaseServerClient } from '@supabase/auth-helpers-sveltekit';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params, locals }) => {
	const {
		data: person,
		error,
		status
	} = await supabaseServerClient(locals.accessToken)
		.from<Person>('person')
		.select('*')
		.eq('person_id', params.id)
		.limit(1)
		.single();

	if (error) {
		return { status: 404 };
	}

	const { data: books, error: errorBooks } = await supabaseServerClient(locals.accessToken)
		.from('book_info')
		.select('*')
		.or(`authors.cs.[{"id":${person.person_id}}],artists.cs.[{"id":${person.person_id}}]`);

	if (errorBooks) {
		return { status: 404 };
	}

	return {
		status,
		body: { person, books }
	};
};
