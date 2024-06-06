import type { BookEdit } from '$lib/server/db/books/books';

function deleteObjKey<T extends Record<K, unknown>, K extends keyof T>(obj: T, key: K) {
	delete obj[key];
	return obj;
}

function deleteObjKeyInArray<T extends Record<K, unknown>, K extends keyof T>(obj: T[], key: K) {
	for (const o of obj) {
		delete o[key];
	}
	return obj;
}

function deleteKeysFromBookEdit(book: BookEdit) {
	deleteObjKey(book, 'id');
	deleteObjKeyInArray(book['titles'], 'book_id');
	deleteObjKeyInArray(book['editions'], 'book_id');
}

export function setupBookEditObjsForEqualityTest(
	book1: BookEdit,
	book2: BookEdit,
): [unknown, unknown] {
	deleteKeysFromBookEdit(book1);
	deleteKeysFromBookEdit(book2);
	return [book1, book2];
}
