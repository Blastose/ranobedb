import { supabaseClient } from '$lib/db';
import type { RequestHandler } from '@sveltejs/kit';
import type Book from '$lib/models/book';

export const GET: RequestHandler = async () => {
	const { data, error, status } = await supabaseClient
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
