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
	type Diff,
} from '$lib/components/history/utils.js';

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

	const [series, seriesHistEdit, changes] = await Promise.all([
		seriesPromise,
		dbSeries.getSeriesHistOneEdit({ id: seriesId, revision }).executeTakeFirst(),
		changesPromise,
	]);

	const prevChange = changes.find((i) => i.revision === previousRevision);
	const change = changes.find((i) => i.revision === revision)!;
	const nextChange = changes.find((i) => i.revision === revision + 1);

	if (!series || !seriesHistEdit) {
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
	if (previousRevision > 0) {
		const prevSeries = await dbSeries
			.getSeriesHistOneEdit({
				id: seriesId,
				revision: previousRevision,
			})
			.executeTakeFirst();
		if (!prevSeries) {
			error(404);
		}
		diff = getDiffLines({
			obj1: prevSeries,
			obj2: seriesHistEdit,
			key: 'titles',
			fn: (v: (typeof seriesHistEdit)['titles']) => generateBookTitleChangeStringFromBooks(v),
			name: 'Title(s)',
		});
		if (diff) {
			diffs.push(diff);
		}
		diff = getDiffLines({
			obj1: prevSeries,
			obj2: seriesHistEdit,
			key: 'books',
			fn: (v: (typeof seriesHistEdit)['books']) => generateSeriesBookChangeStringFromBooks(v),
			name: 'Books',
		});
		if (diff) {
			diffs.push(diff);
		}
		diff = getDiffLines({
			obj1: prevSeries,
			obj2: seriesHistEdit,
			key: 'child_series',
			fn: (v: (typeof seriesHistEdit)['child_series']) =>
				generateSeriesRelationChangeStringFromSeries(v),
			name: 'Series relations',
		});
		if (diff) {
			diffs.push(diff);
		}
		diff = getDiffWords({
			name: 'Hidden',
			words1: prevSeries.hidden.toString(),
			words2: seriesHistEdit.hidden.toString(),
		});
		if (diff) {
			diffs.push(diff);
		}
		diff = getDiffWords({
			name: 'Locked',
			words1: prevSeries.locked.toString(),
			words2: seriesHistEdit.locked.toString(),
		});
		if (diff) {
			diffs.push(diff);
		}
		diff = getDiffWords({
			name: 'Pub. status',
			words1: prevSeries.publication_status,
			words2: seriesHistEdit.publication_status,
		});
		if (diff) {
			diffs.push(diff);
		}
		diff = getDiffWords({
			name: 'Description',
			words1: prevSeries.description,
			words2: seriesHistEdit.description,
		});
		if (diff) {
			diffs.push(diff);
		}
	}

	return {
		seriesId,
		series,
		diffs,
		revision: { revision, previousRevision },
		changes: { prevChange, change, nextChange },
	};
};
