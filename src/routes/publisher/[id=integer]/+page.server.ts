import { db } from '$lib/server/db/db.js';
import { paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers.js';
import { DBPublishers, type PublisherWorks } from '$lib/server/db/publishers/publishers.js';
import { publisherTabsSchema } from '$lib/server/zod/schema.js';
import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async ({ params, locals, url }) => {
	const currentPage = Number(url.searchParams.get('page')) || 1;
	const svTab = await superValidate(url, zod(publisherTabsSchema));
	const tab = svTab.data.tab;
	const id = Number(params.id);

	const dbPublishers = DBPublishers.fromDB(db, locals.user);
	const publisher = await dbPublishers.getPublisher(id).executeTakeFirst();

	if (!publisher) {
		error(404);
	}

	let works: PublisherWorks;
	let count;
	let totalPages;
	if (tab === 'books') {
		const booksQuery = dbPublishers.getBooksBelongingToPublisher(id);
		const {
			result: books,
			count: countBooks,
			totalPages: totalPagesBooks,
		} = await paginationBuilderExecuteWithCount(booksQuery, {
			limit: 24,
			page: currentPage,
		});
		count = countBooks;
		totalPages = totalPagesBooks;
		works = {
			type: tab,
			books,
		};
	} else if (tab === 'series') {
		const seriesQuery = dbPublishers.getSeriesBelongingToPublisher(id);
		const {
			result: series,
			count: countSeries,
			totalPages: totalPagesSeries,
		} = await paginationBuilderExecuteWithCount(seriesQuery, {
			limit: 24,
			page: currentPage,
		});
		count = countSeries;
		totalPages = totalPagesSeries;
		works = {
			type: tab,
			series,
		};
	} else {
		const releasesQuery = dbPublishers.getReleasesBelongingToPublisher(id);
		const {
			result: releases,
			count: countSeries,
			totalPages: totalPagesSeries,
		} = await paginationBuilderExecuteWithCount(releasesQuery, {
			limit: 24,
			page: currentPage,
		});
		count = countSeries;
		totalPages = totalPagesSeries;
		works = {
			type: tab,
			releases,
		};
	}
	return { publisher, works, count, currentPage, totalPages };
};
