import { revisionSchema, seriesSchema } from '$lib/server/zod/schema.js';
import { error, fail, redirect } from '@sveltejs/kit';
import { redirect as flashRedirect } from 'sveltekit-flash-message/server';
import pkg from 'pg';
const { DatabaseError } = pkg;
import { setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { hasEditPerms, hasVisibilityPerms } from '$lib/db/permissions';
import { ChangePermissionError } from '$lib/server/db/errors/errors.js';
import { getCurrentVisibilityStatus } from '$lib/server/db/dbHelpers';
import { revertedRevisionMarkdown } from '$lib/db/revision.js';
import { DBSeries } from '$lib/server/db/series/series.js';
import { DBSeriesActions } from '$lib/server/db/series/actions.js';
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
	const revision = await superValidate(url, zod(revisionSchema));
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
	if (!hasEditPerms(locals.user)) {
		error(403);
	}

	const prefilledComment = revision.data.revision
		? revertedRevisionMarkdown('series', seriesId, revision.data.revision)
		: undefined;

	const form = await superValidate({ ...series, comment: prefilledComment }, zod(seriesSchema), {
		errors: false,
	});

	return { series, form };
};

export const actions = {
	default: async ({ request, locals, params, cookies }) => {
		const id = Number(params.id);
		if (!locals.user) return fail(401);

		const form = await superValidate(request, zod(seriesSchema));
		if (!hasEditPerms(locals.user)) {
			return fail(403, { form });
		}

		if (!form.valid) {
			return fail(400, { form });
		}

		let success = false;
		const dbSeriesActions = DBSeriesActions.fromDB(db);
		try {
			await dbSeriesActions.editSeries({ series: form.data, id }, locals.user);
			success = true;
		} catch (e) {
			if (e instanceof DatabaseError) {
				if (
					e.code === '23505' &&
					e.table === 'series_book' &&
					e.constraint === 'series_book_pkey'
				) {
					return setError(
						form,
						'books._errors',
						'Duplicate books in form. Remove duplicates and try again',
					);
				} else if (
					e.code === '23505' &&
					e.table === 'series_title' &&
					e.constraint === 'series_title_pkey'
				) {
					return setError(
						form,
						'titles._errors',
						'Duplicate titles in form. Remove duplicates and try again',
					);
				} else if (
					e.code === '23505' &&
					e.table === 'series_relation' &&
					e.constraint === 'series_relation_pkey'
				) {
					return setError(
						form,
						'child_series._errors',
						'Duplicate series relations in form. Remove duplicates and try again',
					);
				}
			} else if (e instanceof ChangePermissionError) {
				return fail(403, { form });
			}
			console.log(e);
		}

		if (success) {
			flashRedirect(
				303,
				`/series/${id}`,
				{ type: 'success', message: 'Successfully edited series!' },
				cookies,
			);
		}
		return fail(400, { form });
	},
};
