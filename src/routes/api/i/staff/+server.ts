import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db/db';
import type { Expression, SqlBool } from 'kysely';
import { superValidate } from 'sveltekit-superforms';
import { searchNameSchema } from '$lib/server/zod/schema';
import { zod4 } from 'sveltekit-superforms/adapters';
import { addCharacterBetweenString } from '$lib/db/match.js';

async function getStaffByName(name: string, nameAsNumber: number) {
	return await db
		.selectFrom('staff')
		.innerJoin('staff_alias', 'staff.id', 'staff_alias.staff_id')
		.select(['staff_alias.name', 'staff_alias.staff_id', 'staff_alias.romaji', 'staff_alias.id'])
		.where(({ eb }) => {
			const ors: Expression<SqlBool>[] = [];
			ors.push(eb('staff_alias.name', 'ilike', name));
			ors.push(eb('staff_alias.romaji', 'ilike', name));
			if (!isNaN(nameAsNumber)) {
				ors.push(eb('staff.id', '=', nameAsNumber));
			}
			return eb.or(ors);
		})
		.where('staff.hidden', '=', false)
		.limit(16)
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
	if (name !== '') name = addCharacterBetweenString(name, '%');

	const s = await getStaffByName(name, nameAsNumber);
	return json(s);
};
