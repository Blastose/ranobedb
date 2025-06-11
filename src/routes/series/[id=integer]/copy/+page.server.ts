import { revisionSchema, seriesSchema } from '$lib/server/zod/schema.js';
import { error, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { hasAddPerms, hasVisibilityPerms } from '$lib/db/permissions';
import { getCurrentVisibilityStatus } from '$lib/server/db/dbHelpers';
import { DBSeries } from '$lib/server/db/series/series.js';
import { db } from '$lib/server/db/db.js';
import { buildRedirectUrl } from '$lib/utils/url.js';

export const load = async ({ params, locals, url }) => {
	if (!locals.user) {
		redirect(302, buildRedirectUrl(url, '/login'));
	}

	const id = params.id;
	const seriesId = Number(id);
	let series;

	const dbSeries = DBSeries.fromDB(db, locals.user);
	const revision = await superValidate(url, zod4(revisionSchema));
	if (revision.valid && revision.data.revision) {
		series = await dbSeries
			.getSeriesHistOneEdit({
				id: seriesId,
				revision: revision.data.revision,
			})
			.executeTakeFirst();
	} else {
		series = await dbSeries.getSeriesOneEdit(seriesId).executeTakeFirst();
	}

	if (!series) {
		error(404);
	}

	const visibilityStatus = getCurrentVisibilityStatus(series);

	if (visibilityStatus.locked || visibilityStatus.hidden) {
		if (!hasVisibilityPerms(locals.user)) {
			error(403);
		}
	}
	if (!hasAddPerms(locals.user)) {
		error(403, { missingPerm: 'add' });
	}

	const form = await superValidate({ ...series }, zod4(seriesSchema), {
		errors: false,
	});

	return { series, form };
};
