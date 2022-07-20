import { supabaseServerClient } from '@supabase/auth-helpers-sveltekit';
import type { RequestHandler } from '@sveltejs/kit';
import type Book from '$lib/models/book';

export const GET: RequestHandler = async ({ request }) => {
	const { data, error, status } = await supabaseServerClient(request)
		.from<Book>('book')
		.select('*')
		.order('title_romaji', { ascending: true });

	if (error || data === null) {
		return {
			status
		};
	}

	return {
		status,
		body: { books: data }
	};
};
