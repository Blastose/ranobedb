import { hasAddPerms } from '$lib/db/permissions';
import {
	BookWalkerScraper,
	bookWalkerScraperUrlSchema,
} from '$lib/server/scraper/bookwalker/bookwalker-scraper';
import { fail, message, setError, superValidate } from 'sveltekit-superforms';
import type { Actions } from './$types';
import { zod4 } from 'sveltekit-superforms/adapters';
import { scrapedBookDataSchema } from '$lib/server/zod/schema';
import { isLimited, scraperLimiter } from '$lib/server/rate-limiter/rate-limiter';
import { db } from '$lib/server/db/db';
import { ORIGIN } from '$env/static/private';

export const actions = {
	default: async (event) => {
		const { locals, request } = event;
		if (!locals.user) {
			return fail(401);
		}

		const urlSchemaForm = await superValidate(request, zod4(bookWalkerScraperUrlSchema));
		if (!hasAddPerms(locals.user)) {
			return fail(403, { urlSchemaForm });
		}

		if (!urlSchemaForm.valid) {
			return fail(400, { urlSchemaForm });
		}

		if (await isLimited(scraperLimiter, event)) {
			return message(
				urlSchemaForm,
				{ type: 'error', text: 'Too many attempts; Please wait 10 seconds' },
				{ status: 429 },
			);
		}

		const bookWalkerScraper = new BookWalkerScraper(urlSchemaForm.data.url);
		let data;
		try {
			data = await bookWalkerScraper.scrape();
		} catch (e) {
			console.log(e);
			setError(urlSchemaForm, 'url', String(e));
			return fail(400, { urlSchemaForm });
		}

		const releaseInDb = await db
			.selectFrom('release')
			.where('release.bookwalker', '=', data.scraped_website_url)
			.select('release.id')
			.executeTakeFirst();
		if (releaseInDb) {
			setError(
				urlSchemaForm,
				'url',
				`Error: Book is already in database at ${ORIGIN}/release/${releaseInDb.id}`,
			);
			return fail(400, { urlSchemaForm });
		}

		const form = await superValidate(data, zod4(scrapedBookDataSchema));

		return { form };
	},
} satisfies Actions;
