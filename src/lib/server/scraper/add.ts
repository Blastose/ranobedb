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
	const dbBookActions = DBBookActions.fromDB(db);
	const dbPublisherActions = DBPublisherActions.fromDB(db);
	const dbReleaseActions = DBReleaseActions.fromDB(db);
	const dbStaffActions = DBStaffActions.fromDB(db);
	const dbSeriesActions = DBSeriesActions.fromDB(db);
	const comment = `Imported from ${encodeURI(params.scrapedBookData.scraped_website_url)}`;

	const bookInDbAlready = await db
		.selectFrom('release')
		//                        TODO Change this later (needs to be generic?)
		.where('release.bookwalker', '=', `https://bookwalker.jp/de${params.scrapedBookData.title}/`)
		.executeTakeFirst();
	if (bookInDbAlready) {
		console.log('Alreadu');
		// TODO
		throw new Error('______TODO_______');
	}
	const data = params.scrapedBookData;
	console.log(data);

	let addedBookId;
	if (data.create_book) {
		const newly_added_staff = [];
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
				data.editions[0].staff.push({
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
			const addedStaff = await DBStaff.fromDB(db)
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
			data.editions[0].staff.push({
				...new_staff,
			});
		}

		let img_buffer;
		// TODO remove false later
		// if (false && data.use_img && data.img_url) {
		// 	const maxSizeBytes = 1024 * 1024; // 1,048,576 bytes or 1MB
		// 	const headResponse = await fetch(data.img_url, { method: 'HEAD' });
		// 	const contentLength = headResponse.headers.get('content-length');
		// 	if (contentLength) {
		// 		const size = parseInt(contentLength, 10);
		// 		if (!(size > maxSizeBytes)) {
		// 			const response = await fetch(data.img_url);
		// 			const arrayBuffer = await response.arrayBuffer();
		// 			img_buffer = new File([Buffer.from(arrayBuffer)], '');
		// 		}
		// 	}
		// }

		addedBookId = await dbBookActions.addBook(
			{
				book: bookSchema.parse({
					comment,
					hidden: false,
					locked: false,
					editions: data.editions,
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
		const publisherFull = await DBPublishers.fromDB(db)
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

	const addedReleaseId = await dbReleaseActions.addRelease(
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

	// TODO
	if (data.create_series && data.create_book) {
		// TDOO if series bw is already in, what to do?
		await dbSeriesActions.addSeries(
			{
				series: seriesSchema.parse({
					comment,
					hidden: false,
					locked: false,
					titles: data.series.series_titles,
					child_series: [],
					start_date: 99999999,
					end_date: 99999999,
					olang: 'ja',
					publication_status: 'unknown',
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
