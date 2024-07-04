import { DBChanges } from '$lib/server/db/change/change';
import { db } from '$lib/server/db/db';
import { DBReleases } from '$lib/server/db/releases/releases';
import { historyFiltersSchema } from '$lib/server/zod/schema';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

function getNow() {
	const now = dayjs().format('YYYYMMDD');
	return Number(now);
}

export const load = async ({ locals }) => {
	const now = getNow();

	const form = await superValidate(zod(historyFiltersSchema));
	const dbReleases = DBReleases.fromDB(db);
	const dbChanges = new DBChanges(db);

	const recentlyReleasedPromise = dbReleases
		.getReleasesWithImage()
		.where('release.release_date', '<=', now)
		.orderBy(['release.release_date desc', 'release.id'])
		.limit(10)
		.execute();
	const upcomingReleasesPromise = dbReleases
		.getReleasesWithImage()
		.where('release.release_date', '>=', now)
		.orderBy(['release.release_date asc', 'release.id'])
		.limit(10)
		.execute();
	const recentChangesPromise = dbChanges
		.getChangesAll({
			filters: form.data,
			user: locals.user,
		})
		.limit(10)
		.execute();

	const [recentlyReleased, upcomingReleases, recentChanges] = await Promise.all([
		recentlyReleasedPromise,
		upcomingReleasesPromise,
		recentChangesPromise,
	]);

	return { recentlyReleased, upcomingReleases, recentChanges };
};
