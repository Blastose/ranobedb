import { supabase } from '$lib/supabaseClient';
import type { RequestHandler } from '@sveltejs/kit';
import type Book from '$lib/models/book';

export const GET: RequestHandler = async ({ params }) => {
	const { data, error, status } = await supabase.from<Book>('book').select('*').eq('id', params.id);
	if (error) {
		return { status };
	}

	if (data === null || data.length === 0) {
		return {
			status: 404
		};
	}

	const { publicURL } = supabase.storage
		.from('cover-images')
		.getPublicUrl(`${data[0].cover_image_file_name}.jpg`);

	return {
		status,
		body: { book: data[0], image: publicURL }
	};
};
