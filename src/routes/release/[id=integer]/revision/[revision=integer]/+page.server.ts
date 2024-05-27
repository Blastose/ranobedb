import { getChanges } from '$lib/server/db/change/change.js';
import { hasVisibilityPerms } from '$lib/db/permissions';
import { error, redirect } from '@sveltejs/kit';
import { getCurrentVisibilityStatus } from '$lib/server/db/dbHelpers.js';
import { DBReleases } from '$lib/server/db/releases/releases.js';
import { db } from '$lib/server/db/db.js';
import { getDisplayPrefsUser } from '$lib/display/prefs.js';
import {
	generateReleaseBookChangeStringFromBooks,
	generateReleasePublisherChangeStringFromPublishers,
	getDiffChars,
	getDiffLines,
	getDiffWords,
	pushIfNotUndefined,
	type Diff,
} from '$lib/components/history/utils.js';
import { DateNumber } from '$lib/components/form/release/releaseDate.js';

export const load = async ({ params, locals }) => {
	const id = params.id;
	const releaseId = Number(id);
	const revision = Number(params.revision);
	const previousRevision = revision - 1;

	const dbReleases = DBReleases.fromDB(db, locals.user);
	const releasePromise = dbReleases
		.getReleaseHist({
			id: releaseId,
			revision: revision,
		})
		.executeTakeFirst();
	const changesPromise = getChanges('release', releaseId, [
		previousRevision,
		revision,
		revision + 1,
	]).execute();

	const [release, changes] = await Promise.all([releasePromise, changesPromise]);

	const prevChange = changes.find((i) => i.revision === previousRevision);
	const change = changes.find((i) => i.revision === revision)!;
	const nextChange = changes.find((i) => i.revision === revision + 1);

	if (!release) {
		error(404);
	}

	const visibilityStatus = getCurrentVisibilityStatus(release);

	if (visibilityStatus.hidden) {
		if (!locals.user || (locals.user && !hasVisibilityPerms(locals.user))) {
			// TODO simplier to just redirect, but might want to change it to return data to the page instead
			redirect(302, `/release/${releaseId}`);
		}
	}
	let diff;
	const diffs: Diff[] = [];
	const displayPrefs = getDisplayPrefsUser(locals?.user);
	if (previousRevision > 0) {
		const [prevReleaseHistEdit, releaseHistEdit] = await Promise.all([
			dbReleases
				.getReleaseHistEdit({
					id: releaseId,
					revision: previousRevision,
				})
				.executeTakeFirst(),
			dbReleases.getReleaseHistEdit({ id: releaseId, revision }).executeTakeFirst(),
		]);
		if (!prevReleaseHistEdit || !releaseHistEdit) {
			error(404);
		}
		diff = getDiffChars({
			name: 'Title',
			words1: prevReleaseHistEdit.title,
			words2: releaseHistEdit.title,
		});
		pushIfNotUndefined(diffs, diff);
		diff = getDiffChars({
			name: 'Romaji',
			words1: prevReleaseHistEdit.romaji,
			words2: releaseHistEdit.romaji,
		});
		pushIfNotUndefined(diffs, diff);
		diff = getDiffLines({
			obj1: prevReleaseHistEdit,
			obj2: releaseHistEdit,
			key: 'books',
			fn: (v: (typeof releaseHistEdit)['books']) =>
				generateReleaseBookChangeStringFromBooks(v, displayPrefs.title_prefs),
			name: 'Books',
		});
		pushIfNotUndefined(diffs, diff);
		diff = getDiffLines({
			obj1: prevReleaseHistEdit,
			obj2: releaseHistEdit,
			key: 'publishers',
			fn: (v: (typeof releaseHistEdit)['publishers']) =>
				generateReleasePublisherChangeStringFromPublishers(v, displayPrefs.names),
			name: 'Publishers',
		});
		pushIfNotUndefined(diffs, diff);
		diff = getDiffWords({
			name: 'Hidden',
			words1: prevReleaseHistEdit.hidden.toString(),
			words2: releaseHistEdit.hidden.toString(),
		});
		pushIfNotUndefined(diffs, diff);
		diff = getDiffWords({
			name: 'Locked',
			words1: prevReleaseHistEdit.locked.toString(),
			words2: releaseHistEdit.locked.toString(),
		});
		pushIfNotUndefined(diffs, diff);
		diff = getDiffWords({
			name: 'Format',
			words1: prevReleaseHistEdit.format,
			words2: releaseHistEdit.format,
		});
		pushIfNotUndefined(diffs, diff);
		diff = getDiffChars({
			name: 'ISBN13',
			words1: prevReleaseHistEdit.isbn13,
			words2: releaseHistEdit.isbn13,
		});
		pushIfNotUndefined(diffs, diff);
		diff = getDiffWords({
			name: 'Language',
			words1: prevReleaseHistEdit.lang,
			words2: releaseHistEdit.lang,
		});
		pushIfNotUndefined(diffs, diff);
		diff = getDiffChars({
			name: 'Pages',
			words1: prevReleaseHistEdit.pages?.toString(),
			words2: releaseHistEdit.pages?.toString(),
		});
		pushIfNotUndefined(diffs, diff);
		diff = getDiffChars({
			name: 'Release date',
			words1: new DateNumber(prevReleaseHistEdit.release_date).getDateFormatted(),
			words2: new DateNumber(releaseHistEdit.release_date).getDateFormatted(),
		});
		pushIfNotUndefined(diffs, diff);
		diff = getDiffWords({
			name: 'Note',
			words1: prevReleaseHistEdit.description,
			words2: releaseHistEdit.description,
		});
		pushIfNotUndefined(diffs, diff);
	}

	return {
		releaseId,
		release,
		diffs,
		revision: { revision, previousRevision },
		changes: { prevChange, change, nextChange },
	};
};
