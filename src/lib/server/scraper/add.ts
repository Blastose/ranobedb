import type { z } from 'zod/v4';
import type { User } from '../lucia/lucia';
import { DBBookActions } from '$lib/server/db/books/actions';
import { DBPublisherActions } from '$lib/server/db/publishers/actions';
import { DBReleaseActions } from '$lib/server/db/releases/actions';
import { DBStaffActions } from '$lib/server/db/staff/actions';
import { DBSeriesActions } from '$lib/server/db/series/actions';
import { DBPublishers } from '$lib/server/db/publishers/publishers';
import { db } from '../db/db';
import {
	bookSchema,
	publisherSchema,
	releaseSchema,
	scrapedBookDataSchema,
	seriesSchema,
	staffSchema,
} from '../zod/schema';
import { DBStaff } from '../db/staff/staff';

export async function addFromScrapedBookData(params: {
	user: User;
	scrapedBookData: z.infer<typeof scrapedBookDataSchema>;
}) {
	let addedBookId: number | undefined;
	let addedReleaseId: number | undefined;

	await db.transaction().execute(async (trx) => {
		const dbBookActions = DBBookActions.fromDB(trx);
		const dbPublisherActions = DBPublisherActions.fromDB(trx);
		const dbReleaseActions = DBReleaseActions.fromDB(trx);
		const dbStaffActions = DBStaffActions.fromDB(trx);
		const dbSeriesActions = DBSeriesActions.fromDB(trx);
		const comment = params.scrapedBookData.comment;

		const bookInDbAlready = await db
			.selectFrom('release')
			.where('release.bookwalker', '=', params.scrapedBookData.scraped_website_url)
			.executeTakeFirst();
		if (bookInDbAlready) {
			throw new Error('Already in DB');
		}
		const data = params.scrapedBookData;

		if (data.create_book) {
			const newly_added_staff = [];
			const book_editions = structuredClone(data.editions);
			for (const staff of data.staff_not_in_db) {
				const staffInDb = await db
					.selectFrom('staff')
					.innerJoin('staff_alias', (join) =>
						join
							.onRef('staff_alias.staff_id', '=', 'staff.id')
							.on('staff_alias.main_alias', '=', true),
					)
					.where('staff.bookwalker_id', '=', staff.bw_id ?? -1)
					.select(['staff_alias.staff_id', 'staff.hidden', 'staff_alias.id as aid'])
					.executeTakeFirst();
				if (staffInDb) {
					if (staffInDb.hidden) {
						continue;
					}
					book_editions[0].staff.push({
						staff_alias_id: staffInDb.aid,
						staff_id: staffInDb.staff_id,
						role_type: staff.role_type,
						note: staff.note,
					});
					continue;
				}
				const addedStaffId = await dbStaffActions.addStaff(
					{
						staff: staffSchema.parse({
							comment,
							hidden: false,
							locked: false,
							aliases: [
								{
									main_alias: true,
									name: staff.name,
									romaji: staff.romaji,
								},
							],
							bookwalker_id: staff.bw_id,
						} satisfies z.infer<typeof staffSchema>),
					},
					params.user,
				);
				const addedStaff = await DBStaff.fromDB(trx)
					.getStaffOne(addedStaffId)
					.executeTakeFirstOrThrow();
				newly_added_staff.push({
					staff_alias_id: addedStaff.aliases.find((v) => v.main_alias === true)?.id ?? -1,
					staff_id: addedStaff.id,
					role_type: staff.role_type,
					note: staff.note,
				});
			}
			for (const new_staff of newly_added_staff) {
				book_editions[0].staff.push({
					...new_staff,
				});
			}

			let img_buffer;
			if (data.use_img && data.img_url) {
				const maxSizeBytes = 1024 * 1024; // 1,048,576 bytes or 1MB
				const headResponse = await fetch(data.img_url, { method: 'HEAD' });
				const contentLength = headResponse.headers.get('content-length');
				if (contentLength) {
					const size = parseInt(contentLength, 10);
					if (!(size > maxSizeBytes)) {
						const response = await fetch(data.img_url);
						const arrayBuffer = await response.arrayBuffer();
						img_buffer = new File([Buffer.from(arrayBuffer)], '');
					}
				}
			}

			addedBookId = await dbBookActions.addBook(
				{
					book: bookSchema.parse({
						comment,
						hidden: false,
						locked: false,
						editions: book_editions,
						titles: data.titles,
						description: data.description,
						description_ja: data.description_ja,
						c_release_date: data.release_date,
						olang: 'ja',
						image: img_buffer,
					} satisfies z.infer<typeof bookSchema>),
				},
				params.user,
			);
		}

		const newly_added_publishers = [];
		for (const publisher of data.publishers_not_in_db) {
			const publisherInDb = await db
				.selectFrom('publisher')
				.where('publisher.bookwalker', '=', publisher.bw_url ?? 'NULL')
				.where('publisher.hidden', '=', false)
				.selectAll()
				.executeTakeFirst();
			if (publisherInDb) {
				newly_added_publishers.push({
					id: publisherInDb.id,
					publisher_type: publisher.publisher_type,
					name: '',
				});
				continue;
			} else {
				const addedPublisherId = await dbPublisherActions.addPublisher(
					{
						publisher: publisherSchema.parse({
							child_publishers: [],
							comment,
							hidden: false,
							locked: false,
							name: publisher.name,
							romaji: publisher.romaji,
							bookwalker: publisher.bw_url,
						} satisfies z.infer<typeof publisherSchema>),
					},
					params.user,
				);
				newly_added_publishers.push({
					id: addedPublisherId,
					publisher_type: publisher.publisher_type,
					name: '',
				});
			}
		}

		const allPublishers = [
			...newly_added_publishers.filter((v) => v.publisher_type === 'publisher'),
			...data.publishers,
		];
		for (const publisher of allPublishers) {
			const publisherFull = await DBPublishers.fromDB(trx)
				.getPublisherEdit(publisher.id)
				.executeTakeFirstOrThrow();
			for (const imprint of newly_added_publishers.filter((v) => v.publisher_type === 'imprint')) {
				try {
					await dbPublisherActions.editPublisher(
						{
							id: publisherFull.id,
							publisher: publisherSchema.parse({
								...publisherFull,
								child_publishers: [
									...publisherFull.child_publishers,
									{
										id: imprint.id,
										name: '',
										relation_type: 'imprint',
									},
								],
								comment,
								hidden: false,
								locked: false,
								name: publisherFull.name,
								description: publisherFull.description,
								romaji: publisherFull.romaji,
								bookwalker: publisherFull.bookwalker,
							} satisfies z.infer<typeof publisherSchema>),
						},
						params.user,
					);
				} catch (e) {
					// Ok to fail if the imprint is already part of the relation
				}
			}
		}

		addedReleaseId = await dbReleaseActions.addRelease(
			{
				release: releaseSchema.parse({
					comment,
					books: addedBookId ? [{ id: addedBookId, rtype: 'complete' }] : [],
					format: data.format,
					hidden: false,
					lang: data.lang,
					locked: false,
					publishers: [...data.publishers, ...newly_added_publishers],
					release_date: data.release_date,
					title: data.title,
					romaji: data.romaji,
					pages: data.pages,
					bookwalker: data.bookwalker,
					website: data.website,
					amazon: data.amazon,
					rakuten: data.rakuten,
				} satisfies z.infer<typeof releaseSchema>),
			},
			params.user,
		);

		if (data.create_series && data.create_book) {
			const seriesInDbAlready = await db
				.selectFrom('series')
				.where('series.bookwalker_id', '=', data.series.bw_id ?? -1)
				.executeTakeFirst();
			if (!seriesInDbAlready) {
				await dbSeriesActions.addSeries(
					{
						series: seriesSchema.parse({
							comment,
							hidden: false,
							locked: false,
							titles: data.series.series_titles,
							child_series: [],
							start_date: data.series.start_date,
							end_date: data.series.end_date,
							olang: 'ja',
							publication_status: data.series.publication_status,
							tags: [],
							books: addedBookId
								? [
										{
											book_type: 'main',
											id: addedBookId,
											sort_order: 1,
										},
									]
								: [],
							bookwalker_id: data.series.bw_id,
						} satisfies z.infer<typeof seriesSchema>),
					},
					params.user,
				);
			}
		}
	});

	if (addedBookId) {
		return {
			id: addedBookId,
			type: 'book',
		} as const;
	}
	return {
		id: addedReleaseId,
		type: 'release',
	} as const;
}
