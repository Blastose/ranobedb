import type SeriesInfo from '$lib/models/seriesInfo';
import { supabaseServerClient } from '@supabase/auth-helpers-sveltekit';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params, locals }) => {
	const {
		data: series,
		error,
		status
	} = await supabaseServerClient(locals.accessToken)
		.from<SeriesInfo>('series_info')
		.select('*')
		.eq('id', params.id)
		.limit(1)
		.single();

	if (error) {
		return { status: 404 };
	}

	const { data: books, error: errorBooks } = await supabaseServerClient(locals.accessToken)
		.from('book_info')
		.select(`*, book_series!inner(*)`)
		.eq('book_series.id', params.id)
		.order('release_date', { ascending: true });

	if (errorBooks) {
		return { status: 404 };
	}

	return {
		status,
		body: { series, books }
	};
};
