import { supabaseServerClient } from '@supabase/auth-helpers-sveltekit';
import type { RequestHandler } from '@sveltejs/kit';
import type BookInfo from '$lib/models/bookInfo';

export const GET: RequestHandler = async ({ request }) => {
	const date = new Date();

	const {
		data: dataThisMonth,
		error: errorThisMonth,
		status: statusThisMonth
	} = await supabaseServerClient(request)
		.from<BookInfo>('book_info')
		.select('*')
		.gte('release_date', `${date.getFullYear()}-${date.getMonth() + 1}-01`)
		.order('title_romaji', { ascending: true });

	const { data: dataRecent, error: errorRecent } = await supabaseServerClient(request)
		.from<BookInfo>('book_info')
		.select('*')
		.limit(10)
		.order('id', { ascending: false });

	if (errorThisMonth || errorRecent || dataRecent === null || dataThisMonth === null) {
		return {
			status: statusThisMonth
		};
	}

	return {
		status: 200,
		body: { thisMonthBooks: dataThisMonth, recentBooks: dataRecent }
	};
};
