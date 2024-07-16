import { DBChanges } from '$lib/server/db/change/change.js';
import { hasVisibilityPerms } from '$lib/db/permissions';
import { error, redirect } from '@sveltejs/kit';
import { getCurrentVisibilityStatus } from '$lib/server/db/dbHelpers.js';
import { DBReleases } from '$lib/server/db/releases/releases.js';
import { db } from '$lib/server/db/db.js';
import { getDisplayPrefsUser } from '$lib/display/prefs.js';
import { type Diff } from '$lib/components/history/utils.js';
import { getReleaseDiffs } from '$lib/server/db/releases/diff.js';

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
	const changesPromise = new DBChanges(db)
		.getChanges('release', releaseId, [previousRevision, revision, revision + 1])
		.execute();

	const [release, changes, currentReleaseVisibility] = await Promise.all([
		releasePromise,
		changesPromise,
		db
			.selectFrom('release')
			.where('release.id', '=', releaseId)
			.select(['hidden', 'locked'])
			.executeTakeFirst(),
	]);

	const prevChange = changes.find((i) => i.revision === previousRevision);
	const change = changes.find((i) => i.revision === revision)!;
	const nextChange = changes.find((i) => i.revision === revision + 1);

	if (!release || !currentReleaseVisibility) {
		error(404);
	}

	const visibilityStatus = getCurrentVisibilityStatus(currentReleaseVisibility);

	if (visibilityStatus.hidden) {
		if (!locals.user || (locals.user && !hasVisibilityPerms(locals.user))) {
			// TODO simplier to just redirect, but might want to change it to return data to the page instead
			redirect(302, `/release/${releaseId}`);
		}
	}
	let diffs: Diff[] = [];
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
		diffs = getReleaseDiffs({ prevReleaseHistEdit, releaseHistEdit, displayPrefs });
	}

	return {
		releaseId,
		release,
		diffs,
		revision: { revision, previousRevision },
		changes: { prevChange, change, nextChange },
		currentItemVisibility: currentReleaseVisibility,
	};
};
