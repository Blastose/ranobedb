import { getChanges } from '$lib/server/db/change/change.js';
import { hasVisibilityPerms } from '$lib/db/permissions';
import { error, redirect } from '@sveltejs/kit';
import { getCurrentVisibilityStatus } from '$lib/server/db/dbHelpers.js';
import { DBSeries } from '$lib/server/db/series/series.js';
import { db } from '$lib/server/db/db.js';
import {
	generateBookTitleChangeStringFromBooks,
	generateSeriesBookChangeStringFromBooks,
	generateSeriesRelationChangeStringFromSeries,
	getDiffLines,
	getDiffWords,
	pushIfNotUndefined,
	type Diff,
} from '$lib/components/history/utils.js';
import { getDisplayPrefsUser } from '$lib/display/prefs.js';

export const load = async ({ params, locals }) => {
	const id = params.id;
	const seriesId = Number(id);
	const revision = Number(params.revision);
	const previousRevision = revision - 1;

	const dbSeries = DBSeries.fromDB(db, locals.user);
	const seriesPromise = dbSeries
		.getSeriesHistOne({ id: seriesId, revision: revision })
		.executeTakeFirst();
	const changesPromise = getChanges('series', seriesId, [
		previousRevision,
		revision,
		revision + 1,
	]).execute();

	const [series, changes] = await Promise.all([seriesPromise, changesPromise]);

	const prevChange = changes.find((i) => i.revision === previousRevision);
	const change = changes.find((i) => i.revision === revision)!;
	const nextChange = changes.find((i) => i.revision === revision + 1);

	if (!series) {
		error(404);
	}

	const visibilityStatus = getCurrentVisibilityStatus(series);

	if (visibilityStatus.hidden) {
		if (!locals.user || (locals.user && !hasVisibilityPerms(locals.user))) {
			// TODO simplier to just redirect, but might want to change it to return data to the page instead
			redirect(302, `/series/${seriesId}`);
		}
	}
	let diff;
	const diffs: Diff[] = [];
	const titlePrefs = getDisplayPrefsUser(locals?.user).title_prefs;
	if (previousRevision > 0) {
		const [prevSeriesHistEdit, seriesHistEdit] = await Promise.all([
			dbSeries
				.getSeriesHistOneEdit({
					id: seriesId,
					revision: previousRevision,
				})
				.executeTakeFirst(),
			dbSeries.getSeriesHistOneEdit({ id: seriesId, revision }).executeTakeFirst(),
		]);
		if (!prevSeriesHistEdit || !seriesHistEdit) {
			error(404);
		}
		diff = getDiffLines({
			obj1: prevSeriesHistEdit,
			obj2: seriesHistEdit,
			key: 'titles',
			fn: (v: (typeof seriesHistEdit)['titles']) => generateBookTitleChangeStringFromBooks(v),
			name: 'Title(s)',
		});
		pushIfNotUndefined(diffs, diff);
		diff = getDiffLines({
			obj1: prevSeriesHistEdit,
			obj2: seriesHistEdit,
			key: 'books',
			fn: (v: (typeof seriesHistEdit)['books']) =>
				generateSeriesBookChangeStringFromBooks(v, titlePrefs),
			name: 'Books',
		});
		pushIfNotUndefined(diffs, diff);
		diff = getDiffLines({
			obj1: prevSeriesHistEdit,
			obj2: seriesHistEdit,
			key: 'child_series',
			fn: (v: (typeof seriesHistEdit)['child_series']) =>
				generateSeriesRelationChangeStringFromSeries(v, titlePrefs),
			name: 'Series relations',
		});
		pushIfNotUndefined(diffs, diff);
		diff = getDiffWords({
			name: 'Hidden',
			words1: prevSeriesHistEdit.hidden.toString(),
			words2: seriesHistEdit.hidden.toString(),
		});
		pushIfNotUndefined(diffs, diff);
		diff = getDiffWords({
			name: 'Locked',
			words1: prevSeriesHistEdit.locked.toString(),
			words2: seriesHistEdit.locked.toString(),
		});
		pushIfNotUndefined(diffs, diff);
		diff = getDiffWords({
			name: 'Pub. status',
			words1: prevSeriesHistEdit.publication_status,
			words2: seriesHistEdit.publication_status,
		});
		pushIfNotUndefined(diffs, diff);
		diff = getDiffWords({
			name: 'Description',
			words1: prevSeriesHistEdit.description,
			words2: seriesHistEdit.description,
		});
		pushIfNotUndefined(diffs, diff);
	}

	return {
		seriesId,
		series,
		diffs,
		revision: { revision, previousRevision },
		changes: { prevChange, change, nextChange },
	};
};
