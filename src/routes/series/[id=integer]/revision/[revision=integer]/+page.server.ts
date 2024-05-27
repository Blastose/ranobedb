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
	getChange,
	getChangeDiffWords,
	type Change2,
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
	let resss;
	const diffs: NonNullable<Change2>[] = [];
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
		resss = getChange({
			obj1: prevSeries,
			obj2: seriesHistEdit,
			key: 'books',
			fn: (v: (typeof seriesHistEdit)['books']) => generateSeriesBookChangeStringFromBooks(v),
			name: 'Books',
		});
		if (resss) {
			diffs.push(resss);
		}
		resss = getChange({
			obj1: prevSeries,
			obj2: seriesHistEdit,
			key: 'titles',
			fn: (v: (typeof seriesHistEdit)['titles']) => generateBookTitleChangeStringFromBooks(v),
			name: 'Title(s)',
		});
		if (resss) {
			diffs.push(resss);
		}
		resss = getChange({
			obj1: prevSeries,
			obj2: seriesHistEdit,
			key: 'child_series',
			fn: (v: (typeof seriesHistEdit)['child_series']) =>
				generateSeriesRelationChangeStringFromSeries(v),
			name: 'Series relations',
		});
		if (resss) {
			diffs.push(resss);
		}
		resss = getChangeDiffWords({
			name: 'Hidden',
			words1: prevSeries.hidden.toString(),
			words2: seriesHistEdit.hidden.toString(),
		});
		if (resss) {
			diffs.push(resss);
		}
		resss = getChangeDiffWords({
			name: 'Locked',
			words1: prevSeries.locked.toString(),
			words2: seriesHistEdit.locked.toString(),
		});
		if (resss) {
			diffs.push(resss);
		}
		resss = getChangeDiffWords({
			name: 'Pub. status',
			words1: prevSeries.publication_status,
			words2: seriesHistEdit.publication_status,
		});
		if (resss) {
			diffs.push(resss);
		}
		resss = getChangeDiffWords({
			name: 'Description',
			words1: prevSeries.description,
			words2: seriesHistEdit.description,
		});
		if (resss) {
			diffs.push(resss);
		}
	}

	return {
		seriesId,
		series,
		diff,
		diffs,
		diffTrimmedLinesOuput: resss,
		revision: { revision, previousRevision },
		changes: { prevChange, change, nextChange },
	};
};
