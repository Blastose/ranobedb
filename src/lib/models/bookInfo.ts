type BookInfo = {
	id: number;
	title: string;
	description: string;
	title_romaji: string;
	cover_image_file_name: string;
	publisher: string[];
	artists: { id: number; name: string }[];
	authors: { id: number; name: string }[];
};

export default BookInfo;
