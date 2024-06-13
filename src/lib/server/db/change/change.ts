import type { DB, DbItem } from '$lib/server/db/dbTypes';
import type { Expression, InferResult, SqlBool, Transaction } from 'kysely';
import { db } from '../db';
import type { User } from 'lucia';
import { error } from '@sveltejs/kit';
import { hasVisibilityPerms } from '$lib/db/permissions';
import { withBookHistTitleCte } from '../books/books';
import { withSeriesHistTitleCte } from '../series/series';
import { jsonObjectFrom } from 'kysely/helpers/postgres';

export type Change = InferResult<ReturnType<typeof getChangesAll>>[number];
export const historyItemsPerPage = 25;
export function getChangesAll(params: { user: User | null; item_names: DbItem[] }) {
	const { user, item_names } = params;
	let query = db
		.with('cte_book_hist', withBookHistTitleCte(user?.display_prefs.title_prefs))
		.with('cte_series_hist', withSeriesHistTitleCte(user?.display_prefs.title_prefs))
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
						.select(['release_hist.title'])
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
		.select('auth_user.username')
		.orderBy('change.added desc');

	if (item_names.length > 0) {
		query = query.where(({ eb }) => {
			const ors: Expression<SqlBool>[] = [];
			for (const item_name of item_names) {
				ors.push(eb('change.item_name', '=', item_name));
			}
			return eb.or(ors);
		});
	}

	return query;
}
export function getChanges(item_name: DbItem, item_id: number, revisions?: number[]) {
	return db
		.selectFrom('change')
		.innerJoin('auth_user', 'change.user_id', 'auth_user.id')
		.where('change.item_name', '=', item_name)
		.where('change.item_id', '=', item_id)
		.$if(Boolean(revisions), (qb) =>
			qb.where((eb) => eb.or(revisions!.map((item) => eb('change.revision', '=', item)))),
		)
		.selectAll('change')
		.select('auth_user.username')
		.orderBy('change.revision desc');
}

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
		.orderBy('change.revision desc')
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

export async function itemHiddenError<T extends { hidden: boolean }>(params: {
	item: T;
	itemName: DbItem;
	itemId: number;
	user: User | null;
	title: string;
}) {
	const { item, itemId, itemName, user, title } = params;
	if (item.hidden) {
		if (!user || (user && !hasVisibilityPerms(user))) {
			const change = await getChanges(itemName, itemId)
				.orderBy('change.revision desc')
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
