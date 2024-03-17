import { getChanges } from '$lib/server/db/change/change.js';
import { hasVisibilityPerms } from '$lib/db/permissions';
import { error, redirect } from '@sveltejs/kit';
import { detailedDiff } from 'deep-object-diff';
import { getCurrentVisibilityStatus } from '$lib/server/db/dbHelpers.js';
import { getReleaseHist } from '$lib/server/db/releases/releases.js';

export const load = async ({ params, locals }) => {
	const id = params.id;
	const releaseId = Number(id);
	const revision = Number(params.revision);
	const previousRevision = revision - 1;

	const releasePromise = getReleaseHist({
		id: releaseId,
		revision: revision
	}).executeTakeFirst();
	const changesPromise = getChanges('release', releaseId, [
		previousRevision,
		revision,
		revision + 1
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
	if (previousRevision > 0) {
		const prevRelease = await getReleaseHist({
			id: releaseId,
			revision: previousRevision
		}).executeTakeFirst();
		if (!prevRelease) {
			error(404);
		}
		// TODO diff these better
		diff = detailedDiff(prevRelease, release);
	}

	return {
		releaseId,
		release,
		diff,
		revision: { revision, previousRevision },
		changes: { prevChange, change, nextChange }
	};
};
