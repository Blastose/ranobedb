import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db/db';
import type { Expression, SqlBool } from 'kysely';
import { superValidate } from 'sveltekit-superforms';
import { searchNameSchema } from '$lib/server/zod/schema';
import { zod4 } from 'sveltekit-superforms/adapters';
import { withSeriesTitleCte } from '$lib/server/db/series/series';
import type { User } from '$lib/server/lucia/lucia';
import { sql } from 'kysely';

async function getSeriesByTitle(title: string, titleAsNumber: number, user: User | null) {
	return await db
		.with('cte_series', () =>
			withSeriesTitleCte(user?.display_prefs.title_prefs).where((eb) => {
				const ors: Expression<SqlBool>[] = [];
				ors.push(
					eb(
						'series.id',
						'in',
						eb
							.selectFrom('series_title as st2')
							.select('st2.series_id')
							.where((eb) =>
								eb.or([
									eb(eb.val(title), sql.raw('<%'), eb.ref('st2.title')).$castTo<boolean>(),
									eb(eb.val(title), sql.raw('<%'), eb.ref('st2.romaji')).$castTo<boolean>(),
								]),
							),
					),
				);
				if (!isNaN(titleAsNumber)) {
					ors.push(eb('series.id', '=', titleAsNumber));
				}
				return eb.or(ors);
			}),
		)
		.selectFrom('cte_series')
		.select(['cte_series.title as name', 'cte_series.id', 'cte_series.romaji', 'cte_series.lang'])
		.where('cte_series.hidden', '=', false)
		.innerJoin('series_title', 'series_title.series_id', 'cte_series.id')
		.select((eb) =>
			eb.fn
				.max(
					eb.fn('greatest', [
						eb.fn('word_similarity', [eb.val(title), eb.ref('series_title.title')]),
						eb.fn('word_similarity', [eb.val(title), eb.ref('series_title.romaji')]),
					]),
				)
				.as('sim_score'),
		)
		.orderBy('sim_score', 'desc')
		.orderBy(
			(eb) => eb.fn.coalesce('cte_series.romaji', 'cte_series.title'),
			(ob) => ob.collate('numeric').asc(),
		)
		.groupBy(['cte_series.id', 'cte_series.title', 'cte_series.romaji', 'cte_series.lang'])
		.limit(16)
		.execute();
}
export type ApiSeries = Awaited<ReturnType<typeof getSeriesByTitle>>;

export const GET: RequestHandler = async ({ url, locals }) => {
	const form = await superValidate(url.searchParams, zod4(searchNameSchema));
	if (!form.valid) {
		return json([]);
	}

	const nameAsNumber = Number(form.data.name);
	let name = form.data.name;

	const s = await getSeriesByTitle(name, nameAsNumber, locals.user);
	return json(s);
};
