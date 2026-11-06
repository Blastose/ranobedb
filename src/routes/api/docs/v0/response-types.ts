/**
 * TypeScript response definitions shown on the docs page, copied by hand from the handlers in
 * src/routes/api/v0. Adding an endpoint takes one entry here, one in endpoints.ts and one in
 * examples.ts; `ResponseKey` is derived from this object so a missing entry is a type error.
 */
export const responseTypes = {
	booksResponse: `{
    books:  {
        id: number;
        title: string;
        lang: Language;
        romaji: string | null;
        c_image_id: number | null;
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
        sim_score?: number;
    }[];
    count: string;
    currentPage: number;
    totalPages: number;
}`,
	bookResponse: `{
    book: {
        description: string;
        lang: Language;
        id: number;
        romaji: string | null;
        description_ja: string;
        hidden: boolean;
        c_image_id: number | null;
        olang: Language;
        locked: boolean;
        c_release_date: number;
        c_release_dates: {
            [K in Language]?: number;
        };
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
        rating: {
            score: number;
            count: number;
        } | null;
        num_reviews: {
            count: number;
        } | null;
        user_stats_score: {
            gs: number;
            count: number;
        }[];
        user_stats_label: {
            label_id: number;
            count: number;
        }[];
        titles: {
            lang: Language;
            romaji: string | null;
            book_id: number;
            official: boolean;
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
            release_date_parsed: string | null;
            duration: number | null;
            image_id: number | null;
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
    };
}`,
	publishersResponse: `{
    publishers: {
        id: number;
        name: string;
        romaji: string | null;
        lang: Language;
        sim_score?: number;
    }[];
    count: string;
    currentPage: number;
    totalPages: number;
}`,
	publisherResponse: `{
    publisher: {
        id: number;
        bookwalker: string | null;
        description: string;
        hidden: boolean;
        locked: boolean;
        lang: Language;
        name: string;
        romaji: string | null;
        twitter_id: string | null;
        website: string | null;
        wikidata_id: number | null;
        aliases: string;
        child_publishers: {
            id: number;
            relation_type: "imprint" | "parent brand" | "parent company" | "subsidiary";
            name: string;
            romaji: string | null;
        }[]
    };
}`,
	staffResponse: `{
    staff: {
        id: number;
        name: string;
        romaji: string | null;
        lang: Language;
        sim_score?: number;
    }[];
    count: string;
    currentPage: number;
    totalPages: number;
}`,
	staffOneResponse: `{
    staff: {
        id: number;
        description: string;
        hidden: boolean;
        locked: boolean;
        lang: Language;
        bookwalker_id: number | null;
        pixiv_id: number | null;
        twitter_id: string | null;
        website: string | null;
        wikidata_id: number | null;
        syosetu_id: number | null;
        kakuyomu_id: string | null;
        bsky_id: string | null;
        bookwalker_gl_id: number | null;
        bookwalker_gl_con_id: string | null;
        follow_count: {
            count: number;
        } | null;
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
}`,
	seriesResponse: `{
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
            count: number;
        } | null;
        id: number;
        lang: Language;
        romaji: string | null;
        hidden: boolean;
        locked: boolean;
        title: string;
        olang: Language;
        c_num_books: number;
        c_start_date: number;
        c_end_date: number;
        title_orig: string | null;
        romaji_orig: string | null;
        sim_score?: number;
    }[];
    count: string;
    currentPage: number;
    totalPages: number;
}`,
	seriesOneResponse: `{
    series: {
        id: number;
        lang: Language;
        romaji: string | null;
        title: string;
        hidden: boolean;
        locked: boolean;
        description: string;
        olang: Language;
        bookwalker_id: number | null;
        aliases: string;
        publication_status: "unknown" | "ongoing" | "completed" | "hiatus" | "stalled" | "cancelled";
        anidb_id: number | null;
        start_date: number;
        end_date: number;
        c_start_date: number;
        c_end_date: number;
        web_novel: string | null;
        website: string | null;
        wikidata_id: number | null;
        anilist_id: number | null;
        mal_id: number | null;
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
            c_image_id: number | null;
            c_release_date: number;
            c_release_dates: {
                [K in Language]?: number;
            };
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
        rating: {
            score: number;
            count: number;
        } | null;
        num_reviews: {
            count: number;
        } | null;
        user_stats_score: {
            gs: number;
            count: number;
        }[];
        user_stats_label: {
            label_id: number;
            count: number;
        }[];
        titles: {
            lang: Language;
            romaji: string | null;
            official: boolean;
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
            lang: Language | null;
            staff_alias_id: number;
        }[];
        tags: {
            id: number;
            name: string;
            ttype: "content" | "demographic" | "genre" | "tag";
        }[];
    };
}`,
	releasesResponse: `{
    releases: {
        id: number;
        lang: Language;
        romaji: string | null;
        title: string;
        hidden: boolean;
        locked: boolean;
        description: string;
        duration: number | null;
        image_id: number | null;
        release_date: number;
        release_date_parsed: string | null;
        website: string | null;
        bookwalker: string | null;
        format: "digital" | "print" | "audio";
        pages: number | null;
        isbn13: string | null;
        amazon: string | null;
        rakuten: string | null;
        image: {
            id: number;
            filename: string;
            height: number;
            nsfw: boolean;
            spoiler: boolean;
            width: number;
        } | null;
        sim_score?: number;
    }[];
    count: string;
    currentPage: number;
    totalPages: number;
}`,
	releaseResponse: `{
    release: {
        id: number;
        lang: Language;
        romaji: string | null;
        title: string;
        hidden: boolean;
        locked: boolean;
        description: string;
        duration: number | null;
        image_id: number | null;
        release_date: number;
        release_date_parsed: string | null;
        website: string | null;
        bookwalker: string | null;
        format: "digital" | "print" | "audio";
        pages: number | null;
        isbn13: string | null;
        amazon: string | null;
        rakuten: string | null;
        image: {
            id: number;
            filename: string;
            height: number;
            nsfw: boolean;
            spoiler: boolean;
            width: number;
        } | null;
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
            rtype: "complete" | "partial" | "omnibus";
            image: {
                id: number;
                filename: string;
                height: number;
                nsfw: boolean;
                spoiler: boolean;
                width: number;
            } | null;
        }[];
        user_list_release: {
            release_status: "owned" | "deleted" | "on loan" | "pending" | "unknown" | "notify";
        } | null;
    };
}`,
	tagsResponse: `{
    tags: {
        id: number;
        description: string | null;
        name: string;
        ttype: "content" | "demographic" | "genre" | "tag";
        count: string;
    }[];
    count: string;
    totalPages: number;
    currentPage: number;
}`,
	userMeResponse: `{
    id: string;
    username: string;
    id_numeric: number;
    role: UserRole;
    display_prefs: DisplayPrefs;
    behavior_settings: BehaviorSettings;
    profile_image_filename?: string | null;
    private: boolean;
}`,
	userPutResponse: `{
    success: true;
    action: "add" | "edit";
}`,
	userDeleteResponse: `{
    success: true;
}`,
} as const satisfies Record<string, string>;

export type ResponseKey = keyof typeof responseTypes;

/** Shared by every PUT and DELETE under /user; shown once under "Standard responses". */
export type StandardResponseKey = Extract<ResponseKey, 'userPutResponse' | 'userDeleteResponse'>;

/** Keys whose endpoint documents its own example response. */
export type ExampleKey = Exclude<ResponseKey, StandardResponseKey>;
