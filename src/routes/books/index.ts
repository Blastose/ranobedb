import { supabaseServerClient } from '@supabase/auth-helpers-sveltekit';
import type { RequestHandler } from '@sveltejs/kit';
import type BookInfo from '$lib/models/bookInfo';

export const GET: RequestHandler = async ({ locals }) => {
	const { data, error, status } = await supabaseServerClient(locals.accessToken)
		.from<BookInfo>('book_info')
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
