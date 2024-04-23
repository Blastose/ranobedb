import type { DbItem } from './dbTypes';

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
