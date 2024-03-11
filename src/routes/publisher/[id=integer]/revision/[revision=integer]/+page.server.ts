import { getChanges } from '$lib/server/db/change/change.js';
import { hasVisibilityPerms } from '$lib/db/permissions';
import { error, redirect } from '@sveltejs/kit';
import { detailedDiff } from 'deep-object-diff';
import { getCurrentVisibilityStatus } from '$lib/server/db/dbHelpers.js';
import { getPublisherHist } from '$lib/server/db/publishers/publishers.js';

export const load = async ({ params, locals }) => {
	const id = params.id;
	const publisherId = Number(id);
	const revision = Number(params.revision);
	const previousRevision = revision - 1;

	const publisherPromise = getPublisherHist({
		id: publisherId,
		revision: revision
	}).executeTakeFirst();
	const changesPromise = getChanges('publisher', publisherId, [
		previousRevision,
		revision,
		revision + 1
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
	if (previousRevision > 0) {
		const prevPublisher = await getPublisherHist({
			id: publisherId,
			revision: previousRevision
		}).executeTakeFirst();
		if (!prevPublisher) {
			error(404);
		}
		// TODO diff these better
		diff = detailedDiff(prevPublisher, publisher);
	}

	return {
		publisherId,
		publisher,
		diff,
		revision: { revision, previousRevision },
		changes: { prevChange, change, nextChange }
	};
};
