import type { BookInfo } from '$lib/types/dbTypes';
import { writable, type Writable } from 'svelte/store';

type modalBookType = {
	book: Pick<BookInfo, 'id' | 'title' | 'cover_image_file_name'>;
	status: string | null;
	startDate: string | null;
	finishDate: string | null;
};

const modalBook: Writable<modalBookType | null> = writable(null);

export default modalBook;
