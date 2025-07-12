import type { BooksApi } from '../../../../routes/api/v0/books/+server';
import type { PublishersApi } from '../../../../routes/api/v0/publishers/+server';
import type { ReleasesApi } from '../../../../routes/api/v0/releases/+server';
import type { SeriesApi } from '../../../../routes/api/v0/series/+server';
import type { StaffApi } from '../../../../routes/api/v0/staff/+server';

export async function search(term: string) {
	const termTrimmed = term.trim();

	const booksLimit = 5;
	const booksPromiseOuter = fetch(
		`/api/v0/books?q=${encodeURIComponent(termTrimmed)}&limit=${booksLimit}`,
	);

	const seriesPromiseOuter = fetch(
		`/api/v0/series?q=${encodeURIComponent(termTrimmed)}&limit=${booksLimit}`,
	);

	const publishersPromiseOuter = fetch(
		`/api/v0/publishers?q=${encodeURIComponent(termTrimmed)}&limit=${booksLimit}`,
	);

	const staffPromiseOuter = fetch(
		`/api/v0/staff?q=${encodeURIComponent(termTrimmed)}&limit=${booksLimit}`,
	);

	let releasesPromiseOuter: Promise<Response> | null;
	if (termIsIsbn13(termTrimmed)) {
		releasesPromiseOuter = fetch(`/api/v0/releases?q=${encodeURIComponent(termTrimmed)}&limit=1`);
	} else {
		releasesPromiseOuter = null;
	}

	const [booksPromise, seriesPromise, publishersPromise, staffPromise, releasesPromise] =
		await Promise.all([
			booksPromiseOuter,
			seriesPromiseOuter,
			publishersPromiseOuter,
			staffPromiseOuter,
			releasesPromiseOuter,
		]);

	const [books, series, publishers, staff, releases]: [
		BooksApi,
		SeriesApi,
		PublishersApi,
		StaffApi,
		ReleasesApi | null,
	] = await Promise.all([
		booksPromise.json(),
		seriesPromise.json(),
		publishersPromise.json(),
		staffPromise.json(),
		releasesPromise ? releasesPromise.json() : null,
	]);
	return { books, series, publishers, staff, releases };
}

function termIsIsbn13(t: string) {
	return (t.startsWith('978') || t.startsWith('979')) && t.replaceAll('-', '').length === 13;
}
