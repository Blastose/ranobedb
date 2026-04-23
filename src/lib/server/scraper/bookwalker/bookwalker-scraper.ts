import { BookScraper, type BookData } from '../scraper';
import { scrapeBW } from './scraper';
import { db } from '$lib/server/db/db';
import { scrapedBookDataSchema } from '$lib/server/zod/schema';
import { z } from 'zod/v4';

export const bookWalkerScraperUrlSchema = z.object({
	url: z
		.url()
		.max(100)
		.refine(
			(v) => {
				// We use .refine instead of .regex because SuperForms passes in the pattern to the input component and we don't want that since
				// the browser now handles the regex condition and is not consistent across browsers
				return v.match(
					/^https:\/\/bookwalker\.jp\/de[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}\/?$/,
				);
			},
			{ error: 'URL must match https://bookwalker.jp/de{BookWalker ID}/' },
		),
});

export class BookWalkerScraper extends BookScraper {
	protected async parse(html: string): Promise<BookData> {
		const data = scrapeBW(html);

		const editions: BookData['editions'] = [
			{
				eid: 0,
				staff: [],
				title: 'Original edition',
				lang: null,
			},
		];
		const staff_not_in_db: BookData['staff_not_in_db'] = [];

		for (const foundStaff of data.staff) {
			const maybeStaff = await db
				.selectFrom('staff')
				.innerJoin('staff_alias', (join) =>
					join
						.onRef('staff_alias.staff_id', '=', 'staff.id')
						.on('staff_alias.main_alias', '=', true),
				)
				.where('staff.bookwalker_id', '=', foundStaff.id)
				.select([
					'staff.id as staff_id',
					'staff_alias.id as staff_alias_id',
					'bookwalker_id',
					'staff_alias.name',
					'staff_alias.romaji',
				])
				.executeTakeFirst();
			if (!maybeStaff) {
				staff_not_in_db.push({ ...foundStaff, note: foundStaff.note ?? '', bw_id: foundStaff.id });
			} else {
				editions[0].staff.push({
					...maybeStaff,
					note: foundStaff.note ?? '',
					role_type: foundStaff.role_type,
				});
			}
		}

		const maybePublisher = await db
			.selectFrom('publisher')
			.selectAll()
			.where('publisher.bookwalker', 'ilike', `%bookwalker.jp/company/${data.publisher?.id}/%`)
			.executeTakeFirst();
		const maybeImprint = await db
			.selectFrom('publisher')
			.selectAll()
			.where('publisher.bookwalker', 'ilike', `%bookwalker.jp/label/${data.label?.id}/%`)
			.executeTakeFirst();
		const publishers: {
			id: number;
			name: string;
			publisher_type: 'publisher' | 'imprint';
			romaji?: string | null | undefined;
		}[] = [];
		const publishers_not_in_db: BookData['publishers_not_in_db'] = [];
		if (maybePublisher) {
			if (!maybePublisher.hidden) {
				publishers.push({
					id: maybePublisher.id,
					name: maybePublisher.name,
					romaji: maybePublisher.romaji,
					publisher_type: 'publisher',
				});
			}
		} else {
			publishers_not_in_db.push({
				bw_id: data.publisher?.id,
				name: data.publisher?.name ?? '',
				romaji: '',
				publisher_type: 'publisher',
				bw_url: data.publisher?.url ?? '',
			});
		}
		const imprintsToIgnore = [
			48, // その他(レーベルなし)
			2501, // This one and the ones below have the same imprint name as the publisher name
			1270,
			559,
			4462,
			7574,
			4664,
			3554,
			3480,
			824,
			627,
		];
		if (maybeImprint) {
			if (!maybeImprint.hidden) {
				if (!imprintsToIgnore.includes(maybeImprint.id)) {
					publishers.push({
						id: maybeImprint.id,
						name: maybeImprint.name,
						romaji: maybeImprint.romaji,
						publisher_type: 'imprint',
					});
				}
			}
		} else {
			if (data.label?.id && !imprintsToIgnore.includes(data.label.id)) {
				publishers_not_in_db.push({
					bw_id: data.label?.id,
					name: data.label?.name ?? '',
					romaji: '',
					publisher_type: 'imprint',
					bw_url: data.label?.url ?? null,
				});
			}
		}

		return scrapedBookDataSchema.parse({
			create_series: false,
			series: {
				bw_id: data.series?.id,
				series_titles: [
					{ lang: 'ja', romaji: '', official: true, title: data.series?.name ?? data.title },
				],
				start_date: data.dateNumber,
				end_date: 99999999,
				publication_status: 'unknown',
			},

			titles: [
				{
					lang: 'ja',
					official: true,
					title: data.title,
				},
			],
			scraped_website_url: data.url,
			bookwalker: data.url,
			title: data.title,
			romaji: undefined,
			description: undefined,
			description_ja: data.description + '\n\n' + `[From [BookWalker](${encodeURI(data.url)})]`,
			format: 'digital',
			img_url: data.imageSrc,
			isbn13: '',
			pages: data.pages,
			publishers,
			publishers_not_in_db: publishers_not_in_db,
			release_date: data.dateNumber,
			editions,
			staff_not_in_db: staff_not_in_db,
			lang: 'ja',
			comment: `Add from ${data.url}`,
			book_rel_type: 'complete',
		} satisfies BookData);
	}
}
