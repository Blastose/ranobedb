import { getChanges } from '$lib/server/db/change/change.js';
import { hasVisibilityPerms } from '$lib/db/permissions';
import { error, redirect } from '@sveltejs/kit';
import {
	getCurrentVisibilityStatus,
	paginationBuilderExecuteWithCount,
} from '$lib/server/db/dbHelpers.js';
import { DBPublishers } from '$lib/server/db/publishers/publishers.js';
import {
	generatePublisherRelChangeStringFromPublishers,
	getDiffChars,
	getDiffLines,
	getDiffWords,
	pushIfNotUndefined,
	type Diff,
} from '$lib/components/history/utils.js';
import { db } from '$lib/server/db/db.js';
import { getDisplayPrefsUser } from '$lib/display/prefs.js';

export const load = async ({ params, locals, url }) => {
	const currentPage = Number(url.searchParams.get('page')) || 1;
	const id = params.id;
	const publisherId = Number(id);
	const revision = Number(params.revision);
	const previousRevision = revision - 1;

	const dbPublishers = DBPublishers.fromDB(db, locals.user);
	const publisherPromise = dbPublishers
		.getPublisherHist({
			id: publisherId,
			revision: revision,
		})
		.executeTakeFirst();
	const changesPromise = getChanges('publisher', publisherId, [
		previousRevision,
		revision,
		revision + 1,
	]).execute();

	const [publisher, changes] = await Promise.all([publisherPromise, changesPromise]);

	const prevChange = changes.find((i) => i.revision === previousRevision);
	const change = changes.find((i) => i.revision === revision)!;
	const nextChange = changes.find((i) => i.revision === revision + 1);

	if (!publisher) {
		error(404);
	}

	const visibilityStatus = getCurrentVisibilityStatus(publisher);

	if (visibilityStatus.hidden) {
		if (!locals.user || (locals.user && !hasVisibilityPerms(locals.user))) {
			// TODO simplier to just redirect, but might want to change it to return data to the page instead
			redirect(302, `/publisher/${publisherId}`);
		}
	}
	let diff;
	const diffs: Diff[] = [];
	const displayPrefs = getDisplayPrefsUser(locals?.user);
	if (previousRevision > 0) {
		const [prevPublisherHistEdit, publisherHistEdit] = await Promise.all([
			dbPublishers
				.getPublisherHistEdit({
					id: publisherId,
					revision: previousRevision,
				})
				.executeTakeFirst(),
			dbPublishers.getPublisherHistEdit({ id: publisherId, revision }).executeTakeFirst(),
		]);
		if (!prevPublisherHistEdit || !publisherHistEdit) {
			error(404);
		}
		diff = getDiffChars({
			name: 'Name',
			words1: prevPublisherHistEdit.name,
			words2: publisherHistEdit.name,
		});
		pushIfNotUndefined(diffs, diff);
		diff = getDiffChars({
			name: 'Romaji',
			words1: prevPublisherHistEdit.romaji,
			words2: publisherHistEdit.romaji,
		});
		pushIfNotUndefined(diffs, diff);
		diff = getDiffLines({
			obj1: prevPublisherHistEdit,
			obj2: publisherHistEdit,
			key: 'child_publishers',
			fn: (v: (typeof publisherHistEdit)['child_publishers']) =>
				generatePublisherRelChangeStringFromPublishers(v, displayPrefs.names),
			name: 'Series relations',
		});
		pushIfNotUndefined(diffs, diff);
		diff = getDiffWords({
			name: 'Hidden',
			words1: prevPublisherHistEdit.hidden.toString(),
			words2: publisherHistEdit.hidden.toString(),
		});
		pushIfNotUndefined(diffs, diff);
		diff = getDiffWords({
			name: 'Locked',
			words1: prevPublisherHistEdit.locked.toString(),
			words2: publisherHistEdit.locked.toString(),
		});
		pushIfNotUndefined(diffs, diff);
	}

	const booksQuery = dbPublishers.getBooksBelongingToPublisher(publisherId);
	const {
		result: books,
		count,
		totalPages,
	} = await paginationBuilderExecuteWithCount(booksQuery, {
		limit: 24,
		page: currentPage,
	});

	return {
		publisherId,
		publisher,
		books,
		count,
		totalPages,
		currentPage,
		diffs,
		revision: { revision, previousRevision },
		changes: { prevChange, change, nextChange },
	};
};
