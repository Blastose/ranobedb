import { supabase } from '$lib/supabaseClient';
import type { RequestHandler } from '@sveltejs/kit';
import type Book from '$lib/models/book';

export const GET: RequestHandler = async ({ params }) => {
	const { data, error, status } = await supabase.from<Book>('book').select('*').eq('id', params.id);
	if (error || data === null || data.length === 0) {
		return { status };
	}

	const { publicURL } = supabase.storage
		.from('cover-images')
		.getPublicUrl(`${data[0].cover_image_file_name}.jpg`);

	return {
		status,
		body: { book: data[0], image: publicURL }
	};
};
