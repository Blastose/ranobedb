import type Publisher from '$lib/models/publisher';
import { supabaseServerClient } from '@supabase/auth-helpers-sveltekit';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params, locals }) => {
	const {
		data: publisher,
		error,
		status
	} = await supabaseServerClient(locals.accessToken)
		.from<Publisher>('publisher')
		.select('*')
		.eq('id', params.id)
		.limit(1)
		.single();

	if (error) {
		console.log(error);
		return { status: 404 };
	}

	const { data: books, error: errorBooks } = await supabaseServerClient(locals.accessToken)
		.from('book_info')
		.select('*')
		.contains('publisher', `[{"id":${publisher.id}}]`)
		.order('title_romaji', { ascending: true });

	if (errorBooks) {
		console.log(errorBooks);
		return { status: 404 };
	}

	return {
		status,
		body: { publisher, books }
	};
};
