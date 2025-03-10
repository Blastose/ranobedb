import type { staffSchema } from '$lib/server/zod/schema';
import type { Infer } from 'sveltekit-superforms';
import type { User } from '$lib/server/lucia/lucia';
import { addChange } from '../change/change';
import { hasVisibilityPerms, permissions } from '$lib/db/permissions';
import { ChangePermissionError } from '../errors/errors';
import { jsonArrayFrom } from 'kysely/helpers/postgres';
import type { StaffAlias, StaffAliasHist } from '$lib/server/db/dbTypes';
import type { Insertable, Kysely } from 'kysely';
import { RanobeDB } from '$lib/server/db/db';
import type { DB } from '$lib/server/db/dbTypes';

export class DBStaffActions {
	ranobeDB: RanobeDB;

	constructor(ranobeDB: RanobeDB) {
		this.ranobeDB = ranobeDB;
	}

	static fromDB(db: Kysely<DB>) {
		const ranobeDB = new RanobeDB(db);
		return new this(ranobeDB);
	}

	async editStaff(data: { staff: Infer<typeof staffSchema>; id: number }, user: User) {
		await this.ranobeDB.db.transaction().execute(async (trx) => {
			const currentStaff = await trx
				.selectFrom('staff')
				.where('staff.id', '=', data.id)
				.select(['staff.hidden', 'staff.locked'])
				.select((eb) =>
					jsonArrayFrom(
						eb
							.selectFrom('staff_alias as all_aliases')
							.whereRef('all_aliases.staff_id', '=', 'staff.id')
							.selectAll('all_aliases'),
					).as('aliases'),
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

			const change = await addChange(
				trx,
				{
					comments: data.staff.comment,
					hidden,
					locked,
					item_id: data.id,
					item_name: 'staff',
				},
				user,
			);

			await trx
				.updateTable('staff')
				.set({
					hidden,
					locked,
					description: data.staff.description ?? '',
					bookwalker_id: data.staff.bookwalker_id ?? null,
					bookwalker_gl_id: data.staff.bookwalker_gl_id ?? null,
					pixiv_id: data.staff.pixiv_id ?? null,
					twitter_id: data.staff.twitter_id ?? null,
					website: data.staff.website ?? null,
					wikidata_id: data.staff.wikidata_id ?? null,
					syosetu_id: data.staff.syosetu_id ?? null,
					kakuyomu_id: data.staff.kakuyomu_id ?? null,
					bsky_id: data.staff.bsky_id ?? null,
				})
				.where('staff.id', '=', data.id)
				.executeTakeFirstOrThrow();

			await trx
				.insertInto('staff_hist')
				.values({
					change_id: change.change_id,
					description: data.staff.description ?? '',
					bookwalker_id: data.staff.bookwalker_id,
					bookwalker_gl_id: data.staff.bookwalker_gl_id ?? null,
					pixiv_id: data.staff.pixiv_id,
					twitter_id: data.staff.twitter_id,
					website: data.staff.website,
					wikidata_id: data.staff.wikidata_id,
					syosetu_id: data.staff.syosetu_id,
					kakuyomu_id: data.staff.kakuyomu_id,
					bsky_id: data.staff.bsky_id,
				})
				.executeTakeFirstOrThrow();

			const aliases_to_delete = currentStaff.aliases.filter(
				({ id: id1 }) => !data.staff.aliases.some(({ aid: id2 }) => id2 === id1),
			);
			// console.log('aliases_to_delete');
			// console.log(aliases_to_delete);
			if (aliases_to_delete.length > 0) {
				await trx
					.deleteFrom('staff_alias')
					.where(
						'staff_alias.id',
						'in',
						aliases_to_delete.map((item) => item.id),
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
			// console.log('valid_aids');
			// console.log(valid_aids);
			// console.log(data.staff.aliases);
			const staff_aliases = data.staff.aliases.map((item) => {
				if (item.aid && valid_aids.includes(item.aid)) {
					return {
						main_alias: item.main_alias,
						name: item.name,
						aid: item.aid,
						romaji: item.romaji,
					};
				}
				return {
					main_alias: item.main_alias,
					name: item.name,
					aid: undefined,
					romaji: item.romaji,
				};
			});

			// console.log(staff_aliases);
			if (staff_aliases.filter((item) => Boolean(item.aid)).length < 1) {
				// Throw to prevent user from deleting existing aids and making a new one
				// instead of just renaming it or something
				throw new Error('Invalid aid');
			}

			const aliases_to_update = staff_aliases.filter((item) => Boolean(item.aid));
			// console.log('aliases_to_update');
			// console.log(aliases_to_update);
			for (const item of aliases_to_update) {
				await trx
					.updateTable('staff_alias')
					.set({
						main_alias: item.main_alias,
						name: item.name,
						romaji: item.romaji,
					})
					.where('staff_alias.id', '=', item.aid!)
					.execute();
			}
			const aliases_to_add = staff_aliases.filter((item) => !item.aid);
			// console.log('aliases_to_add');
			// console.log(aliases_to_add);
			let aliases_to_add_with_aid;
			const batched_aliases_to_add = aliases_to_add.map((item) => {
				return {
					main_alias: item.main_alias,
					name: item.name,
					romaji: item.romaji,
					staff_id: data.id,
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
						romaji: item.romaji,
					});
				}
			}
			const batched_aliases_to_add_to_hist = aliases_to_add_to_hist.map((item) => {
				return {
					aid: item.aid!,
					change_id: change.change_id,
					main_alias: item.main_alias,
					name: item.name,
					romaji: item.romaji,
				};
			}) satisfies Insertable<StaffAliasHist>[];
			// console.log('batched_aliases_to_add_to_hist');
			// console.log(batched_aliases_to_add_to_hist);
			if (batched_aliases_to_add_to_hist.length > 0) {
				await trx.insertInto('staff_alias_hist').values(batched_aliases_to_add_to_hist).execute();
			}
		});
	}

	async addStaff(data: { staff: Infer<typeof staffSchema> }, user: User) {
		return await this.ranobeDB.db.transaction().execute(async (trx) => {
			const canChangeVisibility = permissions[user.role].includes('visibility');
			const hidden = canChangeVisibility ? data.staff.hidden : false;
			const locked = canChangeVisibility ? data.staff.hidden || data.staff.locked : false;

			const insertedStaff = await trx
				.insertInto('staff')
				.values({
					hidden,
					locked,
					description: data.staff.description ?? '',
					bookwalker_id: data.staff.bookwalker_id,
					bookwalker_gl_id: data.staff.bookwalker_gl_id ?? null,
					pixiv_id: data.staff.pixiv_id,
					twitter_id: data.staff.twitter_id,
					website: data.staff.website,
					wikidata_id: data.staff.wikidata_id,
					syosetu_id: data.staff.syosetu_id,
					kakuyomu_id: data.staff.kakuyomu_id,
					bsky_id: data.staff.bsky_id,
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
					item_name: 'staff',
				},
				user,
			);

			await trx
				.insertInto('staff_hist')
				.values({
					change_id: change.change_id,
					description: data.staff.description ?? '',
					bookwalker_id: data.staff.bookwalker_id,
					bookwalker_gl_id: data.staff.bookwalker_gl_id ?? null,
					pixiv_id: data.staff.pixiv_id,
					twitter_id: data.staff.twitter_id,
					website: data.staff.website,
					wikidata_id: data.staff.wikidata_id,
					syosetu_id: data.staff.syosetu_id,
					kakuyomu_id: data.staff.kakuyomu_id,
					bsky_id: data.staff.bsky_id,
				})
				.executeTakeFirstOrThrow();

			let aliases_to_add_with_aid;
			const batched_aliases_to_add = data.staff.aliases.map((item) => {
				return {
					main_alias: item.main_alias,
					name: item.name,
					romaji: item.romaji,
					staff_id: insertedStaff.id,
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
						romaji: item.romaji,
					});
				}
			}
			const batched_aliases_to_add_to_hist = aliases_to_add_to_hist.map((item) => {
				return {
					aid: item.aid!,
					change_id: change.change_id,
					main_alias: item.main_alias,
					name: item.name,
					romaji: item.romaji,
				};
			}) satisfies Insertable<StaffAliasHist>[];
			if (batched_aliases_to_add_to_hist.length > 0) {
				await trx.insertInto('staff_alias_hist').values(batched_aliases_to_add_to_hist).execute();
			}

			return insertedStaff.id;
		});
	}
}
