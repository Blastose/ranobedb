import { db } from '$lib/server/db/db';
import type { SavedFilterEntry } from '$lib/server/zod/schema';
import type { DbItem } from '$lib/server/db/dbTypes';
import { defaultFilterName } from '$lib/db/dbConsts';

export async function getSavedFilters(
	userId: string | undefined,
	itemName: DbItem,
	isList: boolean,
): Promise<SavedFilterEntry[]> {
	if (!userId) {
		return [];
	}

	return db
		.selectFrom('saved_filter')
		.select(['saved_filter.name', 'saved_filter.filters'])
		.where('saved_filter.user_id', '=', userId)
		.where('saved_filter.item_name', '=', itemName)
		.where('saved_filter.is_list', '=', isList)
		.orderBy((eb) => eb.case().when('saved_filter.name', '=', 'Default').then(0).else(1).end())
		.orderBy('saved_filter.name', 'asc')
		.execute();
}

export async function getDefaultSavedFilter(
	userId: string | undefined,
	itemName: DbItem,
	isList: boolean,
): Promise<{ filters: string } | undefined> {
	if (!userId) {
		return undefined;
	}

	return db
		.selectFrom('saved_filter')
		.select('saved_filter.filters')
		.where('saved_filter.user_id', '=', userId)
		.where('saved_filter.item_name', '=', itemName)
		.where('saved_filter.is_list', '=', isList)
		.where('saved_filter.name', '=', defaultFilterName)
		.executeTakeFirst();
}
