export const load = async () => {
	const booksResponse = `{
    books:  {
        id: number;
        title: string;
        lang: Language;
        romaji: string | null;
        image_id: number | null;
        olang: Language;
        c_release_date: number;
        title_orig: string | null;
        romaji_orig: string | null;
        image: {
            id: number;
            filename: string;
            height: number;
            nsfw: boolean;
            spoiler: boolean;
            width: number;
        } | null;
    }[];
    count: string;
    currentPage: number;
    totalPages: number;
}`;
	const bookResponse = `{
    description: string;
    lang: Language;
    id: number;
    romaji: string | null;
    description_ja: string;
    hidden: boolean;
    image_id: number | null;
    olang: Language;
    locked: boolean;
    c_release_date: number;
    title: string;
    title_orig: string | null;
    romaji_orig: string | null;
    image: {
        id: number;
        filename: string;
        height: number;
        nsfw: boolean;
        spoiler: boolean;
        width: number;
    } | null;
    titles: {
        lang: Language;
        romaji: string | null;
        book_id: number;
        official: true;
        title: string;
    }[];
    editions: {
        book_id: number;
        lang: Language | null;
        title: string;
        eid: number;
        staff: {
            note: string;
            role_type: "editor" | "staff" | "author" | "artist" | "translator" | "narrator";
            romaji: string | null;
            name: string;
            staff_id: number;
            staff_alias_id: number;
        }[];
    }[];
    releases: {
        lang: Language;
        id: number;
        romaji: string | null;
        description: string;
        hidden: boolean;
        locked: boolean;
        release_date: number;
        title: string;
        website: string | null;
        amazon: string | null;
        bookwalker: string | null;
        format: "digital" | "print" | "audio";
        isbn13: string | null;
        pages: number | null;
        rakuten: string | null;
    }[];
    publishers: {
        lang: Language;
        id: number;
        romaji: string | null;
        name: string;
        publisher_type: "publisher" | "imprint";
    }[];
    series: {
        books: {
            id: number;
            lang: Language;
            romaji: string | null;
            title: string;
            title_orig: string | null;
            romaji_orig: string | null;
            image: {
                id: number;
                filename: string;
                height: number;
                nsfw: boolean;
                spoiler: boolean;
                width: number;
            } | null;
        }[];
        tags: {
            id: number;
            name: string;
            ttype: "tag" | "content" | "demographic" | "genre";
        }[];
        lang: Language;
        id: number;
        romaji: string | null;
        title: string;
        title_orig: string | null;
        romaji_orig: string | null;
    } | undefined
}`;

	const publishersResponse = `{
    publishers: {
        id: number;
        name: string;
        romaji: string | null;
    }[];
    count: string;
    currentPage: number;
    totalPages: number;
}`;

	const publisherResponse = `{
    publisher: {
        id: number;
        bookwalker: string | null;
        description: string;
        hidden: boolean;
        locked: boolean;
        name: string;
        romaji: string | null;
        twitter_id: string | null;
        website: string | null;
        wikidata_id: number | null;
        child_publishers: {
            id: number;
            relation_type: "imprint" | "parent brand" | "parent company" | "subsidiary";
            name: string;
            romaji: string | null;
        }[]
    };
}`;

	const staffResponse = `{
    staff: {
        id: number;
        name: string;
        romaji: string | null;
    }[];
    count: string;
    currentPage: number;
    totalPages: number;
}`;

	const staffOneResponse = `{
    staff: {
        id: number;
        description: string;
        hidden: boolean;
        locked: boolean;
        bookwalker_id: number | null;
        pixiv_id: number | null;
        twitter_id: string | null;
        website: string | null;
        wikidata_id: number | null;
        romaji: string | null;
        name: string;
        aliases: {
            id: number;
            romaji: string | null;
            main_alias: boolean;
            name: string;
            staff_id: number;
        }[];
    };
}`;

	const seriesResponse = `{
    series: {
        book: {
            id: number;
            image: {
                id: number;
                filename: string;
                height: number;
                nsfw: boolean;
                spoiler: boolean;
                width: number;
            } | null;
        } | null;
        volumes: {
            count: string | number | bigint;
        } | null;
        id: number;
        lang: "id" | "ja" | "en" | "zh-Hans" | "zh-Hant" | "fr" | "es" | "ko" | "ar" | "bg" | "ca" | "cs" | "ck" | "da" | "de" | ... 35 more
        romaji: string | null;
        hidden: boolean;
        locked: boolean;
        title: string;
        olang: "id" | "ja" | "en" | "zh-Hans" | "zh-Hant" | "fr" | "es" | "ko" | "ar" | "bg" | "ca" | "cs" | "ck" | "da" | "de" | ... 35 more
        c_num_books: number;
        title_orig: string | null;
        romaji_orig: string | null;
    }[];
    count: string;
    currentPage: number;
    totalPages: number;
}`;

	const seriesOneResponse = `{
    id: number;
    lang: Language;
    romaji: string | null;
    title: string;
    hidden: boolean;
    locked: boolean;
    description: string;
    olang: Language;
    bookwalker_id: number | null;
    wikidata_id: number | null;
    aliases: string;
    publication_status: "unknown" | "ongoing" | "completed" | "hiatus" | "stalled" | "cancelled";
    anidb_id: number | null;
    start_date: number;
    end_date: number;
    web_novel: string | null;
    title_orig: string | null;
    romaji_orig: string | null;
    book_description: {
        description: string;
        description_ja: string;
    } | null;
    books: {
        book_type: "main" | "sub";
        sort_order: number;
        id: number;
        lang: Language;
        romaji: string | null;
        title: string;
        image_id: number | null;
        c_release_date: number;
        title_orig: string | null;
        romaji_orig: string | null;
        image: {
            id: number;
            filename: string;
            height: number;
            nsfw: boolean;
            spoiler: boolean;
            width: number;
        } | null;
    }[];
    titles: {
        lang: Language;
        romaji: string | null;
        official: true;
        title: string;
    }[];
    child_series: {
        id: number;
        relation_type: "prequel" | "sequel" | "side story" | "main story" | "spin-off" | "parent story" | "alternate version";
        lang: Language;
        romaji: string | null;
        title: string;
    }[];
    publishers: {
        id: number;
        romaji: string | null;
        name: string;
        publisher_type: "publisher" | "imprint";
        lang: Language;
    }[];
    staff: {
        role_type: "staff" | "author" | "artist" | "editor" | "translator" | "narrator";
        note: string;
        romaji: string | null;
        name: string;
        staff_id: number;
        lang: Language;
        staff_alias_id: number;
    }[];
    tags: {
        id: number;
        name: string;
        ttype: "content" | "demographic" | "genre" | "tag";
    }[];
}`;

	const releasesResponse = `{
    releases: {
        id: number;
        lang: Language;
        romaji: string | null;
        title: string;
        hidden: boolean;
        locked: boolean;
        description: string;
        release_date: number;
        website: string | null;
        bookwalker: string | null;
        format: "digital" | "print" | "audio";
        pages: number | null;
        isbn13: string | null;
        amazon: string | null;
        rakuten: string | null;
    }[];
    count: string;
    currentPage: number;
    totalPages: number;
}`;

	const releaseResponse = `{
    release: {
        id: number;
        lang: Language;
        romaji: string | null;
        title: string;
        hidden: boolean;
        locked: boolean;
        description: string;
        release_date: number;
        website: string | null;
        bookwalker: string | null;
        format: "digital" | "print" | "audio";
        pages: number | null;
        isbn13: string | null;
        amazon: string | null;
        rakuten: string | null;
        publishers: {
            publisher_type: "publisher" | "imprint";
            id: number;
            romaji: string | null;
            name: string;
        }[];
        books: {
            id: number;
            lang: Language;
            romaji: string | null;
            title: string;
            title_orig: string | null;
            romaji_orig: string | null;
            sort_order: number | null;
            image: {
                id: number;
                filename: string;
                height: number;
                nsfw: boolean;
                spoiler: boolean;
                width: number;
            } | null;
        }[];
    };
}`;

	const tagsResponse = `{
    tags: {
        id: number;
        description: string | null;
        name: string;
        ttype: "content" | "demographic" | "genre" | "tag";
        count: string | number | bigint;
    }[];
    count: string;
    totalPages: number;
    currentPage: number;
}`;

	return {
		booksResponse,
		bookResponse,
		publishersResponse,
		publisherResponse,
		staffResponse,
		staffOneResponse,
		seriesResponse,
		seriesOneResponse,
		releasesResponse,
		releaseResponse,
		tagsResponse,
	};
};
