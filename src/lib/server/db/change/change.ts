import type { DB, DbItem } from '$lib/server/db/dbTypes';
import type { Expression, InferResult, Kysely, SqlBool, Transaction } from 'kysely';
import type { User } from '$lib/server/lucia/lucia';
import { error } from '@sveltejs/kit';
import { hasVisibilityPerms } from '$lib/db/permissions';
import { withBookHistTitleCte } from '../books/books';
import { withSeriesHistTitleCte } from '../series/series';
import { jsonObjectFrom } from 'kysely/helpers/postgres';
import type { HistoryFilters } from '$lib/server/zod/schema';
import { ranobeBot } from '../user/ranobebot';

export class DBChanges {
	db: Kysely<DB>;

	constructor(db: Kysely<DB>) {
		this.db = db;
	}

	getChangesAll(params: { user: User | null; filters: HistoryFilters }) {
		const { user, filters } = params;
		let query = this.db
			.with('cte_book_hist', () => withBookHistTitleCte(user?.display_prefs.title_prefs))
			.with('cte_series_hist', () => withSeriesHistTitleCte(user?.display_prefs.title_prefs))
			.selectFrom('change')
			.innerJoin('auth_user', 'change.user_id', 'auth_user.id')
			.selectAll('change')
			// This $if is a hack to make the select results as optional, so getChangesAll and getChanges have the same type
			.$if(true, (qb) =>
				qb.select((eb) => [
					jsonObjectFrom(
						eb
							.selectFrom('cte_book_hist')
							.select([
								'cte_book_hist.title',
								'cte_book_hist.title_orig',
								'cte_book_hist.romaji',
								'cte_book_hist.romaji_orig',
								'cte_book_hist.lang',
							])
							.whereRef('cte_book_hist.id', '=', 'change.id')
							.limit(1),
					).as('book'),
					jsonObjectFrom(
						eb
							.selectFrom('cte_series_hist')
							.select([
								'cte_series_hist.title',
								'cte_series_hist.title_orig',
								'cte_series_hist.romaji',
								'cte_series_hist.romaji_orig',
								'cte_series_hist.lang',
							])
							.whereRef('cte_series_hist.id', '=', 'change.id')
							.limit(1),
					).as('series'),
					jsonObjectFrom(
						eb
							.selectFrom('release_hist')
							.select(['release_hist.title', 'release_hist.romaji', 'release_hist.lang'])
							.whereRef('release_hist.change_id', '=', 'change.id')
							.limit(1),
					).as('release'),
					jsonObjectFrom(
						eb
							.selectFrom('publisher_hist')
							.select(['publisher_hist.name', 'publisher_hist.romaji'])
							.whereRef('publisher_hist.change_id', '=', 'change.id')
							.limit(1),
					).as('publisher'),
					jsonObjectFrom(
						eb
							.selectFrom('staff_hist')
							.innerJoin('staff_alias_hist', (join) =>
								join
									.onRef('staff_alias_hist.change_id', '=', 'staff_hist.change_id')
									.on('staff_alias_hist.main_alias', '=', true),
							)
							.select(['staff_alias_hist.name', 'staff_alias_hist.romaji'])
							.whereRef('staff_hist.change_id', '=', 'change.id')
							.limit(1),
					).as('staff'),
				]),
			)
			.select(['auth_user.username', 'auth_user.id_numeric'])
			.orderBy('change.id', 'desc');

		if (filters.items.length > 0) {
			query = query.where(({ eb }) => {
				const ors: Expression<SqlBool>[] = [];
				for (const item of filters.items) {
					ors.push(eb('change.item_name', '=', item));
				}
				return eb.or(ors);
			});
		}

		if (filters.hide_automated) {
			query = query.where('change.user_id', '!=', ranobeBot.id);
		}

		if (filters.change_type === 'add') {
			query = query.where('change.revision', '=', 1);
		} else if (filters.change_type === 'edit') {
			query = query.where('change.revision', '!=', 1);
		}

		if (filters.visibility === 'deleted') {
			// TODO Right now, this just queries items that are hidden at that revision, not items that the latest revision and hidden
			query = query.where('change.ihid', '=', true);
		} else if (filters.visibility === 'public') {
			query = query.where('change.ihid', '=', false);
		} else if (filters.visibility === 'locked') {
			query = query.where('change.ilock', '=', true);
		}

		return query;
	}

	getChanges(item_name: DbItem, item_id: number, revisions?: number[]) {
		return this.db
			.selectFrom('change')
			.innerJoin('auth_user', 'change.user_id', 'auth_user.id')
			.where('change.item_name', '=', item_name)
			.where('change.item_id', '=', item_id)
			.$if(Boolean(revisions), (qb) =>
				qb.where((eb) => eb.or(revisions!.map((item) => eb('change.revision', '=', item)))),
			)
			.selectAll('change')
			.select(['auth_user.username', 'auth_user.id_numeric'])
			.orderBy('change.revision', 'desc');
	}

	async itemHiddenError<T extends { hidden: boolean }>(params: {
		item: T;
		itemName: DbItem;
		itemId: number;
		user: User | null;
		title: string;
	}) {
		const { item, itemId, itemName, user, title } = params;
		if (item.hidden) {
			if (!user || (user && !hasVisibilityPerms(user))) {
				const change = await this.getChanges(itemName, itemId)
					.orderBy('change.revision', 'desc')
					.executeTakeFirstOrThrow();
				error(403, {
					dbItemDeleted: {
						reason: change.comments,
						title: title,
					},
				});
			}
		}
	}
}

export type Change = InferResult<ReturnType<DBChanges['getChangesAll']>>[number];
export const historyItemsPerPage = 25;

export async function addChange(
	trx: Transaction<DB>,
	changeItem: {
		item_name: DbItem;
		item_id: number;
		comments: string;
		locked: boolean;
		hidden: boolean;
	},
	user: { id: string },
) {
	const revision = await trx
		.selectFrom('change')
		.where('change.item_name', '=', changeItem.item_name)
		.where('change.item_id', '=', changeItem.item_id)
		.select('change.revision')
		.orderBy('change.revision', 'desc')
		.limit(1)
		.executeTakeFirst();

	const revisionNumber = revision?.revision ? revision.revision + 1 : 1;

	const change = await trx
		.insertInto('change')
		.values({
			ihid: changeItem.hidden,
			ilock: changeItem.locked,
			item_name: changeItem.item_name,
			item_id: changeItem.item_id,
			revision: revisionNumber,
			user_id: user.id,
			comments: changeItem.comments,
		})
		.returning('change.id')
		.executeTakeFirstOrThrow();
	return { change_id: change.id, revision: revisionNumber };
}
