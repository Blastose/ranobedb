import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db/db';
import type { Expression, SqlBool } from 'kysely';
import { superValidate } from 'sveltekit-superforms';
import { searchNameSchema } from '$lib/server/zod/schema';
import { zod4 } from 'sveltekit-superforms/adapters';
import { sql } from 'kysely';

async function getStaffByName(name: string, nameAsNumber: number) {
	return await db
		.selectFrom('staff')
		.innerJoin('staff_alias as sa2', 'staff.id', 'sa2.staff_id')
		.select(['sa2.name', 'sa2.staff_id', 'sa2.romaji', 'sa2.id'])
		.select((eb) =>
			eb
				.fn('greatest', [
					eb.fn('word_similarity', [eb.val(name), eb.ref('sa2.name')]),
					eb.fn('word_similarity', [eb.val(name), eb.ref('sa2.romaji')]),
				])
				.as('sim_score'),
		)
		.where(({ eb }) => {
			const ors: Expression<SqlBool>[] = [];
			ors.push(
				eb.or([
					eb(eb.val(name), sql.raw('<%'), eb.ref('sa2.name')).$castTo<boolean>(),
					eb(eb.val(name), sql.raw('<%'), eb.ref('sa2.romaji')).$castTo<boolean>(),
				]),
			);
			if (!isNaN(nameAsNumber)) {
				ors.push(eb('staff.id', '=', nameAsNumber));
			}
			return eb.or(ors);
		})
		.where('staff.hidden', '=', false)
		.limit(16)
		.orderBy('sim_score', 'desc')
		.execute();
}
export type ApiStaff = Awaited<ReturnType<typeof getStaffByName>>;

export const GET: RequestHandler = async ({ url }) => {
	const form = await superValidate(url.searchParams, zod4(searchNameSchema));
	if (!form.valid) {
		return json([]);
	}

	const nameAsNumber = Number(form.data.name);
	let name = form.data.name;

	const s = await getStaffByName(name, nameAsNumber);
	return json(s);
};
