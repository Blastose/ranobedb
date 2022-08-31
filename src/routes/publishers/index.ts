import type Publisher from '$lib/models/publisher';
import { supabaseServerClient } from '@supabase/auth-helpers-sveltekit';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals }) => {
	const { data, error, status } = await supabaseServerClient(locals.accessToken)
		.from<Publisher>('publisher')
		.select('*')
		.order('id', { ascending: true });

	if (error) {
		console.error(error);
		return { status };
	}

	return {
		status,
		body: { publishers: data }
	};
};
