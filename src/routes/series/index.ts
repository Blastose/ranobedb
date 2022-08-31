import { supabaseServerClient } from '@supabase/auth-helpers-sveltekit';
import type { RequestHandler } from '@sveltejs/kit';
import type SeriesInfo from '$lib/models/seriesInfo';

export const GET: RequestHandler = async ({ locals }) => {
	const {
		data: series,
		error,
		status
	} = await supabaseServerClient(locals.accessToken)
		.from<SeriesInfo>('series_info')
		.select('*')
		.order('book_title_romaji', { ascending: true });

	if (error || series === null) {
		return {
			status: 404
		};
	}

	return {
		status,
		body: { series }
	};
};
