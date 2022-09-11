type BookInfo = {
	id: number;
	title: string;
	description: string;
	title_romaji: string;
	release_date: Date;
	volume: string;
	cover_image_file_name: string;
	publisher: { id: number; name: string }[];
	artists: { id: number; name: string }[];
	authors: { id: number; name: string }[];
};

export default BookInfo;
