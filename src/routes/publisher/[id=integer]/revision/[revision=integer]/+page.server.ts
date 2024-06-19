import { DBChanges } from '$lib/server/db/change/change.js';
import { hasVisibilityPerms } from '$lib/db/permissions';
import { error, redirect } from '@sveltejs/kit';
import { getCurrentVisibilityStatus } from '$lib/server/db/dbHelpers.js';
import { DBPublishers } from '$lib/server/db/publishers/publishers.js';
import { type Diff } from '$lib/components/history/utils.js';
import { db } from '$lib/server/db/db.js';
import { getDisplayPrefsUser } from '$lib/display/prefs.js';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { publisherTabsSchema } from '$lib/server/zod/schema.js';
import { getPublisherDiffs } from '$lib/server/db/publishers/diff.js';

export const load = async ({ params, locals, url }) => {
	const currentPage = Number(url.searchParams.get('page')) || 1;
	const id = params.id;
	const svTab = await superValidate(url, zod(publisherTabsSchema));
	const tab = svTab.data.tab;
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
	const changesPromise = new DBChanges(db)
		.getChanges('publisher', publisherId, [previousRevision, revision, revision + 1])
		.execute();

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
	let diffs: Diff[] = [];
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
		diffs = getPublisherDiffs({ prevPublisherHistEdit, publisherHistEdit, displayPrefs });
	}

	const { count, totalPages, works } = await dbPublishers.getWorksPaged({
		id: publisherId,
		currentPage,
		tab,
	});

	return {
		publisherId,
		publisher,
		works,
		count,
		totalPages,
		currentPage,
		diffs,
		revision: { revision, previousRevision },
		changes: { prevChange, change, nextChange },
	};
};
