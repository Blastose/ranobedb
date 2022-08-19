type Release = {
	name: string;
	id: number;
	book_id: number;
	lang: string;
	release_date: Date;
	format: string;
	isbn13: string;
	publisher: string[];
};

export default Release;
