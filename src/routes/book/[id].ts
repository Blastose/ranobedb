import { supabaseClient } from '$lib/db';
import { supabaseServerClient } from '@supabase/auth-helpers-sveltekit';
import type { RequestHandler } from '@sveltejs/kit';
import type Book from '$lib/models/book';

export const GET: RequestHandler = async ({ params, locals, request }) => {
	const { data, error, status } = await supabaseServerClient(request)
		.from<Book>('book')
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

	const { publicURL } = supabaseClient.storage
		.from('cover-images')
		.getPublicUrl(`${data[0].cover_image_file_name}.jpg`);

	if (locals.user) {
		const { data: readData, error } = await supabaseServerClient(request)
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

		let readingStatus: string | null;
		if (error) {
			readingStatus = null;
		} else {
			readingStatus = readData.reader_labels[0].label_name;
		}

		return {
			status,
			body: { book: data[0], image: publicURL, readingStatus }
		};
	}

	return {
		status,
		body: { book: data[0], image: publicURL, readingStatus: null }
	};
};
