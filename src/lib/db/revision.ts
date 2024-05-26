import type { DbItem } from '../server/db/dbTypes';

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
