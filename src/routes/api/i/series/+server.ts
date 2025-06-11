import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db/db';
import type { Expression, SqlBool } from 'kysely';
import { superValidate } from 'sveltekit-superforms';
import { searchNameSchema } from '$lib/server/zod/schema';
import { zod4 } from 'sveltekit-superforms/adapters';
import { withSeriesTitleCte } from '$lib/server/db/series/series';
import type { User } from '$lib/server/lucia/lucia';
import { addCharacterBetweenString } from '$lib/db/match.js';

async function getSeriesByTitle(title: string, titleAsNumber: number, user: User | null) {
	return await db
		.with('cte_series', () => withSeriesTitleCte(user?.display_prefs.title_prefs))
		.selectFrom('cte_series')
		.select(['cte_series.title as name', 'cte_series.id', 'cte_series.romaji', 'cte_series.lang'])
		.where(({ eb }) => {
			const ors: Expression<SqlBool>[] = [];
			ors.push(
				eb('cte_series.id', 'in', (eb) =>
					eb
						.selectFrom('series')
						.innerJoin('series_title', (join) =>
							join.onRef('series_title.series_id', '=', 'series.id'),
						)
						.where((eb2) =>
							eb2.or([
								eb2('series_title.title', 'ilike', title),
								eb2('series_title.romaji', 'ilike', title),
							]),
						)
						.select('series.id'),
				),
			);
			if (!isNaN(titleAsNumber)) {
				ors.push(eb('cte_series.id', '=', titleAsNumber));
			}
			return eb.or(ors);
		})
		.where('cte_series.hidden', '=', false)
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
	if (name !== '') name = addCharacterBetweenString(name, '%');

	const s = await getSeriesByTitle(name, nameAsNumber, locals.user);
	return json(s);
};
