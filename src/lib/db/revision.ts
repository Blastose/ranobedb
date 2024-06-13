import { getNameDisplay, getTitleDisplay } from '$lib/display/prefs';
import type { Change } from '$lib/server/db/change/change';
import type { DisplayPrefs } from '$lib/server/zod/schema';
import type { DbItem } from '../server/db/dbTypes';

type DbItemPrefix = 'b' | 's' | 'st' | 'p' | 'r';
const dbItemMap: Record<DbItem, DbItemPrefix> = {
	book: 'b',
	publisher: 'p',
	release: 'r',
	series: 's',
	staff: 'st',
};

export function buildRevisionMarkdownLink(
	prefix: string,
	dbItem: DbItem,
	id: number,
	revision: number,
) {
	return `[${prefix}${id}.${revision}](/${dbItem}/${id}/revision/${revision})`;
}

export function revertedRevisionMarkdown(
	prefix: string,
	dbItem: DbItem,
	id: number,
	revision: number,
) {
	return `Reverted to revision ${buildRevisionMarkdownLink(prefix, dbItem, id, revision)}`;
}

// TODO replace prefix with dbItemMap[dbItem]
export function reverseRelationUpdateMarkdown(
	prefix: string,
	dbItem: DbItem,
	id: number,
	revision: number,
) {
	return `Reverse relation update caused by revision ${buildRevisionMarkdownLink(
		prefix,
		dbItem,
		id,
		revision,
	)}`;
}

export function buildRevisionLink(
	dbItem: DbItem,
	item_id: number,
	revision: number,
): { href: string; text: string } {
	return {
		href: `/${dbItem}/${item_id}/revision/${revision}`,
		text: `${dbItemMap[dbItem]}${item_id}.${revision}`,
	};
}

export function getHistoryEntryTitle(change: Change, displayPrefs: DisplayPrefs) {
	if (change.item_name === 'book') {
		if (change.book) {
			return getTitleDisplay({ obj: change.book, prefs: displayPrefs.title_prefs });
		}
	} else if (change.item_name === 'series') {
		if (change.series) {
			return getTitleDisplay({ obj: change.series, prefs: displayPrefs.title_prefs });
		}
	} else if (change.item_name === 'release') {
		if (change.release) {
			return getNameDisplay({ obj: change.release, prefs: displayPrefs.names });
		}
	} else if (change.item_name === 'publisher') {
		if (change.publisher) {
			return getNameDisplay({ obj: change.publisher, prefs: displayPrefs.names });
		}
	} else if (change.item_name === 'staff') {
		if (change.staff) {
			return getNameDisplay({ obj: change.staff, prefs: displayPrefs.names });
		}
	}
}
