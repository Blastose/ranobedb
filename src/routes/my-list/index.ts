import { supabaseServerClient, withApiAuth } from '@supabase/auth-helpers-sveltekit';
import type { RequestHandler } from '@sveltejs/kit';
import type BookInfo from '$lib/models/bookInfo';
import type Reader from '$lib/models/reader';
import type Reads from '$lib/models/reads';
import type ReaderLabels from '$lib/models/readerLabels';

export const GET: RequestHandler = async ({ url, locals }) =>
	withApiAuth({ redirectTo: '/', user: locals.user }, async () => {
		const query = supabaseServerClient(locals.accessToken)
			.from<BookInfo & Reader & Reads & ReaderLabels>('reader_list')
			.select('*')
			.eq('auth_id', locals.user.id)
			.order('finish_date', { ascending: true });

		const labelName = url.searchParams.get('label-name');
		if (labelName) {
			query.eq('label_name', labelName);
		}

		const { data, error, status } = await query;

		if (error || data === null) {
			return {
				status
			};
		}

		return {
			status,
			body: { books: data }
		};
	});
