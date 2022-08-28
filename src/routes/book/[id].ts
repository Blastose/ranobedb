import { supabaseClient } from '$lib/db';
import { supabaseServerClient } from '@supabase/auth-helpers-sveltekit';
import type { RequestHandler } from '@sveltejs/kit';
import type BookInfo from '$lib/models/bookInfo';
import type Release from '$lib/models/release';

export const GET: RequestHandler = async ({ params, locals }) => {
	const { data, error, status } = await supabaseServerClient(locals.accessToken)
		.from<BookInfo>('book_info')
		.select('*')
		.eq('id', params.id);
	if (error) {
		return { status };
	}

	if (data === null || data.length === 0) {
		return {
			status: 404
		};
	}

	const { data: releases, error: relError } = await supabaseServerClient(locals.accessToken)
		.from<Release>('book_releases')
		.select('*')
		.eq('book_id', params.id);
	if (relError) {
		return {
			status: 404
		};
	}

	const { data: seriesBooks, error: sError } = await supabaseServerClient(locals.accessToken).rpc(
		'get_books_same_series',
		{
			f_book_id: params.id
		}
	);
	if (sError) {
		return {
			status: 404
		};
	}

	const { publicURL } = supabaseClient.storage
		.from('covers')
		.getPublicUrl(`${data[0].cover_image_file_name}.jpg`);

	let readingStatus: string | null = null;
	if (locals.user) {
		const { data: readData, error } = await supabaseServerClient(locals.accessToken)
			.from('reads')
			.select(
				`
				*,
				reader_labels (label_name),
				reader!inner (reader_id)
			`
			)
			.eq('book_id', params.id)
			.eq('reader.auth_id', locals.user.id)
			.limit(1)
			.single();

		if (!error) {
			readingStatus = readData.reader_labels[0].label_name;
		}
	}

	return {
		status,
		body: { book: data[0], seriesBooks, releases, image: publicURL, readingStatus }
	};
};
