import type { staffSchema } from '$lib/zod/schema';
import type { Infer } from 'sveltekit-superforms';
import { db } from '../db';
import type { User } from 'lucia';
import { addChange } from '../change/change';
import { hasVisibilityPerms, permissions } from '$lib/db/permissions';
import { ChangePermissionError, HasRelationsError } from '../errors/errors';
import { jsonArrayFrom } from 'kysely/helpers/postgres';
import type { StaffAlias, StaffAliasHist } from '$lib/db/dbTypes';
import type { Insertable } from 'kysely';

export async function editStaff(
	data: { staff: Infer<typeof staffSchema>; id: number },
	user: User
) {
	await db.transaction().execute(async (trx) => {
		const currentStaff = await trx
			.selectFrom('staff')
			.where('staff.id', '=', data.id)
			.select(['staff.hidden', 'staff.locked'])
			.select((eb) =>
				jsonArrayFrom(
					eb
						.selectFrom('staff_alias as all_aliases')
						.whereRef('all_aliases.staff_id', '=', 'staff.id')
						.selectAll('all_aliases')
				).as('aliases')
			)
			.executeTakeFirstOrThrow();

		const userHasVisibilityPerms = hasVisibilityPerms(user);
		const hidden = userHasVisibilityPerms ? data.staff.hidden : currentStaff.hidden;
		const locked = userHasVisibilityPerms
			? data.staff.hidden || data.staff.locked
			: currentStaff.locked;

		if (currentStaff.hidden || currentStaff.locked) {
			if (!userHasVisibilityPerms) {
				throw new ChangePermissionError('');
			}
		}

		if (!currentStaff.hidden && data.staff.hidden) {
			if (currentStaff.aliases.length > 0) {
				throw new HasRelationsError('');
			}
		}

		const change = await addChange(
			trx,
			{
				comments: data.staff.comment,
				hidden,
				locked,
				item_id: data.id,
				item_name: 'staff'
			},
			user
		);

		await trx
			.updateTable('staff')
			.set({
				bookwalker_id: data.staff.bookwalker_id,
				description: data.staff.description ?? '',
				hidden,
				locked
			})
			.where('staff.id', '=', data.id)
			.executeTakeFirstOrThrow();

		await trx
			.insertInto('staff_hist')
			.values({
				description: data.staff.description ?? '',
				bookwalker_id: data.staff.bookwalker_id,
				change_id: change.change_id
			})
			.executeTakeFirstOrThrow();

		const aliases_to_delete = currentStaff.aliases.filter(
			({ id: id1 }) => !data.staff.aliases.some(({ aid: id2 }) => id2 === id1)
		);
		console.log('aliases_to_delete');
		console.log(aliases_to_delete);
		if (aliases_to_delete.length > 0) {
			await trx
				.deleteFrom('staff_alias')
				.where(
					'staff_alias.id',
					'in',
					aliases_to_delete.map((item) => item.id)
				)
				.execute();
		}

		const aliases_with_aids = data.staff.aliases
			.filter((item) => Boolean(item.aid))
			.map((item) => item.aid!);
		const valid_aids =
			aliases_with_aids.length > 0
				? (
						await trx
							.selectFrom('staff_alias')
							.where('staff_alias.id', 'in', aliases_with_aids)
							.select('staff_alias.id')
							.execute()
				  ).map((item) => item.id)
				: [];
		console.log('valid_aids');
		console.log(valid_aids);

		console.log(data.staff.aliases);
		const staff_aliases = data.staff.aliases.map((item) => {
			if (item.aid && valid_aids.includes(item.aid)) {
				return {
					main_alias: item.main_alias,
					name: item.name,
					aid: item.aid,
					romaji: item.romaji
				};
			}
			return {
				main_alias: item.main_alias,
				name: item.name,
				aid: undefined,
				romaji: item.romaji
			};
		});

		console.log(staff_aliases);
		if (staff_aliases.filter((item) => Boolean(item.aid)).length < 1) {
			// Throw to prevent user from deleting existing aids and making a new one
			// instead of just renaming it or something
			throw new Error('Invalid aid');
		}

		const aliases_to_update = staff_aliases.filter((item) => Boolean(item.aid));
		console.log('aliases_to_update');
		console.log(aliases_to_update);
		for (const item of aliases_to_update) {
			await trx
				.updateTable('staff_alias')
				.set({
					main_alias: item.main_alias,
					name: item.name,
					romaji: item.romaji
				})
				.where('staff_alias.id', '=', item.aid!)
				.execute();
		}
		const aliases_to_add = staff_aliases.filter((item) => !item.aid);
		console.log('aliases_to_add');
		console.log(aliases_to_add);
		// TODO check if only one main alias?
		// if (aliases_to_add.filter((item) => item.main_alias).length + 1 > 1) {
		// 	throw new Error('Too many main aliases');
		// }
		let aliases_to_add_with_aid;
		const batched_aliases_to_add = aliases_to_add.map((item) => {
			return {
				main_alias: item.main_alias,
				name: item.name,
				romaji: item.romaji,
				staff_id: data.id
			};
		}) satisfies Insertable<StaffAlias>[];
		if (batched_aliases_to_add.length > 0) {
			aliases_to_add_with_aid = await trx
				.insertInto('staff_alias')
				.values(batched_aliases_to_add)
				.returningAll()
				.execute();
		}
		const aliases_to_add_to_hist = [...aliases_to_update];
		if (aliases_to_add_with_aid) {
			for (const item of aliases_to_add_with_aid) {
				aliases_to_add_to_hist.push({
					main_alias: item.main_alias,
					name: item.name,
					aid: item.id,
					romaji: item.romaji
				});
			}
		}
		const batched_aliases_to_add_to_hist = aliases_to_add_to_hist.map((item) => {
			return {
				aid: item.aid!,
				change_id: change.change_id,
				main_alias: item.main_alias,
				name: item.name,
				romaji: item.romaji
			};
		}) satisfies Insertable<StaffAliasHist>[];
		console.log('batched_aliases_to_add_to_hist');
		console.log(batched_aliases_to_add_to_hist);
		if (batched_aliases_to_add_to_hist.length > 0) {
			await trx.insertInto('staff_alias_hist').values(batched_aliases_to_add_to_hist).execute();
		}
	});
}

export async function addStaff(data: { staff: Infer<typeof staffSchema> }, user: User) {
	return await db.transaction().execute(async (trx) => {
		const canChangeVisibility = permissions[user.role].includes('visibility');
		const hidden = canChangeVisibility ? data.staff.hidden : false;
		const locked = canChangeVisibility ? data.staff.hidden || data.staff.locked : false;

		const insertedStaff = await trx
			.insertInto('staff')
			.values({
				description: data.staff.description ?? '',
				bookwalker_id: data.staff.bookwalker_id,
				hidden,
				locked
			})
			.returning('staff.id')
			.executeTakeFirstOrThrow();

		const change = await addChange(
			trx,
			{
				comments: data.staff.comment,
				hidden,
				locked,
				item_id: insertedStaff.id,
				item_name: 'staff'
			},
			user
		);

		await trx
			.insertInto('staff_hist')
			.values({
				description: data.staff.description ?? '',
				bookwalker_id: data.staff.bookwalker_id,
				change_id: change.change_id
			})
			.executeTakeFirstOrThrow();

		let aliases_to_add_with_aid;
		const batched_aliases_to_add = data.staff.aliases.map((item) => {
			return {
				main_alias: item.main_alias,
				name: item.name,
				romaji: item.romaji,
				staff_id: insertedStaff.id
			};
		}) satisfies Insertable<StaffAlias>[];
		if (batched_aliases_to_add.length > 0) {
			aliases_to_add_with_aid = await trx
				.insertInto('staff_alias')
				.values(batched_aliases_to_add)
				.returningAll()
				.execute();
		}
		const aliases_to_add_to_hist = [];
		if (aliases_to_add_with_aid) {
			for (const item of aliases_to_add_with_aid) {
				aliases_to_add_to_hist.push({
					main_alias: item.main_alias,
					name: item.name,
					aid: item.id,
					romaji: item.romaji
				});
			}
		}
		const batched_aliases_to_add_to_hist = aliases_to_add_to_hist.map((item) => {
			return {
				aid: item.aid!,
				change_id: change.change_id,
				main_alias: item.main_alias,
				name: item.name,
				romaji: item.romaji
			};
		}) satisfies Insertable<StaffAliasHist>[];
		if (batched_aliases_to_add_to_hist.length > 0) {
			await trx.insertInto('staff_alias_hist').values(batched_aliases_to_add_to_hist).execute();
		}

		return insertedStaff.id;
	});
}
