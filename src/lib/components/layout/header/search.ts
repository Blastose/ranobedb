import type { BooksApi } from '../../../../routes/api/v0/books/+server';
import type { PublishersApi } from '../../../../routes/api/v0/publishers/+server';
import type { SeriesApi } from '../../../../routes/api/v0/series/+server';
import type { StaffApi } from '../../../../routes/api/v0/staff/+server';

export async function search(term: string) {
	const booksLimit = 5;
	const booksPromise = (await (
		await fetch(`/api/v0/books?q=${encodeURIComponent(term)}&limit=${booksLimit}`)
	).json()) as BooksApi;

	const seriesPromise = (await (
		await fetch(`/api/v0/series?q=${encodeURIComponent(term)}&limit=${booksLimit}`)
	).json()) as SeriesApi;

	const publishersPromise = (await (
		await fetch(`/api/v0/publishers?q=${encodeURIComponent(term)}&limit=${booksLimit}`)
	).json()) as PublishersApi;

	const staffPromise = (await (
		await fetch(`/api/v0/staff?q=${encodeURIComponent(term)}&limit=${booksLimit}`)
	).json()) as StaffApi;

	const [books, series, publishers, staff] = await Promise.all([
		booksPromise,
		seriesPromise,
		publishersPromise,
		staffPromise,
	]);

	return { books, series, publishers, staff };
}
