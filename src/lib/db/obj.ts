import type { BookEdit } from '$lib/server/db/books/books';
import type { PublisherEdit } from '$lib/server/db/publishers/publishers';
import type { ReleaseEdit } from '$lib/server/db/releases/releases';
import type { SeriesEdit } from '$lib/server/db/series/series';
import type { StaffEdit } from '$lib/server/db/staff/staff';

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

function deleteKeysFromPublisherEdit(publisher: PublisherEdit) {
	deleteObjKey(publisher, 'id');
}

export function setupPublisherEditObjsForEqualityTest(
	publisher1: PublisherEdit,
	publisher2: PublisherEdit,
): [unknown, unknown] {
	deleteKeysFromPublisherEdit(publisher1);
	deleteKeysFromPublisherEdit(publisher2);
	return [publisher1, publisher2];
}

function deleteKeysFromReleaseEdit(release: ReleaseEdit) {
	deleteObjKey(release, 'id');
	deleteObjKeyInArray(release['books'], 'id');
	deleteObjKeyInArray(release['publishers'], 'id');
}

export function setupReleaseEditObjsForEqualityTest(
	release1: ReleaseEdit,
	release2: ReleaseEdit,
): [unknown, unknown] {
	deleteKeysFromReleaseEdit(release1);
	deleteKeysFromReleaseEdit(release2);
	return [release1, release2];
}

function deleteKeysFromSeriesEdit(series: SeriesEdit) {
	deleteObjKey(series, 'id');
	deleteObjKeyInArray(series['books'], 'id');
	deleteObjKeyInArray(series['child_series'], 'id');
}

export function setupSeriesEditObjsForEqualityTest(
	series1: SeriesEdit,
	series2: SeriesEdit,
): [unknown, unknown] {
	deleteKeysFromSeriesEdit(series1);
	deleteKeysFromSeriesEdit(series2);
	return [series1, series2];
}

function deleteKeysFromStaffEdit(staff: StaffEdit) {
	deleteObjKey(staff, 'id');
	deleteObjKeyInArray(staff['aliases'], 'staff_id');
}

export function setupStaffEditObjsForEqualityTest(
	staff1: StaffEdit,
	staff2: StaffEdit,
): [unknown, unknown] {
	deleteKeysFromStaffEdit(staff1);
	deleteKeysFromStaffEdit(staff2);
	return [staff1, staff2];
}
