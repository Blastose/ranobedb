import type { BooksApi } from '../../../../routes/api/v0/books/+server';
import type { SeriesApi } from '../../../../routes/api/v0/series/+server';

export async function search(term: string) {
	const booksLimit = 5;
	const booksPromise = (await (
		await fetch(`/api/v0/books?q=${encodeURIComponent(term)}&limit=${booksLimit}`)
	).json()) as BooksApi;

	const seriesPromise = (await (
		await fetch(`/api/v0/series?q=${encodeURIComponent(term)}&limit=${booksLimit}`)
	).json()) as SeriesApi;

	const [books, series] = await Promise.all([booksPromise, seriesPromise]);

	return { books: books, series: series };
}
