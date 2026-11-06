import type { ExampleKey } from './response-types';

/**
 * Trimmed responses captured from the public RanobeDB database.
 * Long strings end in an ellipsis, nested arrays keep one or two items and every
 * object key from the real response is retained.
 */
export const responseExamples: Record<ExampleKey, string> = {
	booksResponse: `{
  "books": [
    {
      "id": 48857,
      "c_image_id": 49346,
      "lang": "ja",
      "romaji": null,
      "romaji_orig": null,
      "title": ".hack// AI buster",
      "title_orig": ".hack// AI buster",
      "c_release_date": 20020928,
      "olang": "ja",
      "image": {"id": 49346, "width": 240, "height": 339, "spoiler": true, "nsfw": false, "filename": "syVVhiUZKMvK5aX0.jpg"}
    },
    {
      "id": 48861,
      "c_image_id": 49350,
      "lang": "ja",
      "romaji": null,
      "romaji_orig": null,
      "title": ".hack// AI buster2",
      "title_orig": ".hack// AI buster2",
      "c_release_date": 20050531,
      "olang": "ja",
      "image": {"id": 49350, "width": 240, "height": 341, "spoiler": true, "nsfw": false, "filename": "HXGJdxDSkvv1PY6p.jpg"}
    }
  ],
  "count": "55627",
  "currentPage": 1,
  "totalPages": 27814
}`,
	bookResponse: `{
  "book": {
    "description": "",
    "description_ja": "ネット世界を逃げ惑うひとりの少女に出会ったときから、主人公アルビレオの放浪と戦いの旅は始まった！…",
    "id": 48857,
    "c_image_id": 49346,
    "lang": "ja",
    "romaji": null,
    "romaji_orig": null,
    "title": ".hack// AI buster",
    "title_orig": ".hack// AI buster",
    "c_release_date": 20020928,
    "c_release_dates": {"de": 20080899, "ja": 20020928},
    "olang": "ja",
    "locked": false,
    "hidden": false,
    "image": {"id": 49346, "width": 240, "height": 339, "spoiler": true, "nsfw": false, "filename": "syVVhiUZKMvK5aX0.jpg"},
    "rating": null,
    "num_reviews": {"count": 0},
    "user_stats_score": [{"gs": 10, "count": 0}],
    "user_stats_label": [],
    "titles": [{"book_id": 48857, "lang": "ja", "official": true, "title": ".hack// AI buster", "romaji": null}],
    "editions": [{"book_id": 48857, "eid": 0, "title": "Original edition", "lang": null, "staff": [{"role_type": "author", "name": "浜崎達也", "romaji": "Hamazaki Tatsuya", "staff_id": 2459, "staff_alias_id": 2459, "note": ""}]}],
    "releases": [{"id": 97528, "release_date": 20020928, "pages": null, "format": "print", "lang": "ja", "locked": false, "hidden": false, "description": "", "title": ".hack// AI buster", "romaji": null, "isbn13": "9784044222048", "website": "https://sneakerbunko.jp/product/dothack/200206000136.html", "amazon": "https://www.amazon.co.jp/dp/4044222045", "bookwalker": null, "rakuten": null, "release_date_parsed": "2002-09-28", "duration": null, "image_id": 49346}],
    "publishers": [{"id": 9, "name": "KADOKAWA", "romaji": null, "publisher_type": "publisher", "lang": "ja"}],
    "series": {
      "books": [{"id": 48857, "title": ".hack// AI buster", "title_orig": ".hack// AI buster", "romaji": null, "romaji_orig": null, "lang": "ja", "image": {"id": 49346, "width": 240, "height": 339, "spoiler": true, "nsfw": false, "filename": "syVVhiUZKMvK5aX0.jpg"}}],
      "tags": [],
      "title": ".hack",
      "title_orig": ".hack",
      "romaji": null,
      "romaji_orig": null,
      "id": 19881,
      "lang": "ja"
    }
  }
}`,
	seriesResponse: `{
  "series": [
    {
      "book": {"id": 12040, "image": {"id": 12040, "width": 240, "height": 339, "spoiler": false, "nsfw": false, "filename": "CREz48RNPpCuZbIs.jpg"}},
      "volumes": {"count": 46},
      "id": 3343,
      "hidden": false,
      "locked": false,
      "lang": "en",
      "romaji": null,
      "romaji_orig": "Re: Zero kara Hajimeru Isekai Seikatsu",
      "title": "Re:ZERO -Starting Life in Another World-",
      "title_orig": "Re:ゼロから始める異世界生活",
      "olang": "ja",
      "c_num_books": 46,
      "c_start_date": 20140124,
      "c_end_date": 99999999
    },
    {
      "book": {"id": 12020, "image": {"id": 12020, "width": 240, "height": 343, "spoiler": false, "nsfw": false, "filename": "pvwmfdMtLZn4dXkU.jpg"}},
      "volumes": {"count": 26},
      "id": 3336,
      "hidden": false,
      "locked": false,
      "lang": "en",
      "romaji": null,
      "romaji_orig": "Mushoku Tensei ~Isekai Ittara Honki Dasu~",
      "title": "Mushoku Tensei: Jobless Reincarnation",
      "title_orig": "無職転生 ~異世界行ったら本気だす~",
      "olang": "ja",
      "c_num_books": 26,
      "c_start_date": 20140124,
      "c_end_date": 20221125
    }
  ],
  "count": "23116",
  "currentPage": 1,
  "totalPages": 11558
}`,
	seriesOneResponse: `{
  "series": {
    "id": 3343,
    "bookwalker_id": 11978,
    "hidden": false,
    "locked": false,
    "lang": "en",
    "publication_status": "ongoing",
    "romaji": null,
    "romaji_orig": "Re: Zero kara Hajimeru Isekai Seikatsu",
    "title": "Re:ZERO -Starting Life in Another World-",
    "title_orig": "Re:ゼロから始める異世界生活",
    "description": "",
    "aliases": "",
    "anidb_id": 11370,
    "start_date": 20140124,
    "end_date": 99999999,
    "c_start_date": 20140124,
    "c_end_date": 99999999,
    "web_novel": "https://ncode.syosetu.com/n2267be/",
    "website": "https://re-zero.com/",
    "wikidata_id": 20718351,
    "anilist_id": 85737,
    "mal_id": 74697,
    "olang": "ja",
    "book_description": {"description": "Subaru Natsuki was just trying to get to the convenience store but wound up summoned to another world. He encounters…", "description_ja": "幾多の絶望を越え、死の運命から少女を救え！…"},
    "books": [{"id": 12040, "title": "Re:ZERO -Starting Life in Another World-, Vol. 1", "title_orig": "Re:ゼロから始める異世界生活 1", "romaji": null, "romaji_orig": "Re: Zero kara Hajimeru Isekai Seikatsu 1", "c_image_id": 12040, "lang": "en", "c_release_date": 20140124, "c_release_dates": {"en": 20160719, "ja": 20140124}, "sort_order": 1, "book_type": "main", "image": {"id": 12040, "width": 240, "height": 339, "spoiler": false, "nsfw": false, "filename": "CREz48RNPpCuZbIs.jpg"}}],
    "rating": null,
    "num_reviews": {"count": 0},
    "user_stats_score": [{"gs": 10, "count": 0}],
    "user_stats_label": [],
    "titles": [{"title": "Re:ゼロから始める異世界生活", "romaji": "Re: Zero kara Hajimeru Isekai Seikatsu", "lang": "ja", "official": true}],
    "child_series": [{"id": 22936, "title": "Re:ゼロから始める異世界生活 Re:zeropedia", "romaji": "Re:Zero kara Hajimeru Isekai Seikatsu Re:Zeropedia", "lang": "ja", "relation_type": "side story"}],
    "publishers": [{"id": 9, "name": "KADOKAWA", "romaji": null, "publisher_type": "publisher", "lang": "ja"}],
    "staff": [{"role_type": "author", "name": "長月達平", "romaji": "Nagatsuki Tappei", "staff_id": 3070, "staff_alias_id": 3070, "note": "", "lang": null}],
    "tags": [{"name": "action", "ttype": "genre", "id": 1}]
  }
}`,
	releasesResponse: `{
  "releases": [
    {"id": 97528, "release_date": 20020928, "pages": null, "format": "print", "lang": "ja", "locked": false, "hidden": false, "description": "", "title": ".hack// AI buster", "romaji": null, "isbn13": "9784044222048", "website": "https://sneakerbunko.jp/product/dothack/200206000136.html", "amazon": "https://www.amazon.co.jp/dp/4044222045", "bookwalker": null, "rakuten": null, "release_date_parsed": "2002-09-28", "duration": null, "image_id": 49346, "image": {"id": 49346, "width": 240, "height": 339, "spoiler": true, "nsfw": false, "filename": "syVVhiUZKMvK5aX0.jpg"}},
    {"id": 97532, "release_date": 20050531, "pages": null, "format": "print", "lang": "ja", "locked": false, "hidden": false, "description": "", "title": ".hack// AI buster2", "romaji": null, "isbn13": "9784044222062", "website": "https://sneakerbunko.jp/product/dothack/200404000253.html", "amazon": "https://www.amazon.co.jp/dp/4044222061", "bookwalker": null, "rakuten": null, "release_date_parsed": "2005-05-31", "duration": null, "image_id": 49350, "image": {"id": 49350, "width": 240, "height": 341, "spoiler": true, "nsfw": false, "filename": "HXGJdxDSkvv1PY6p.jpg"}}
  ],
  "count": "116706",
  "currentPage": 1,
  "totalPages": 58353
}`,
	releaseResponse: `{
  "release": {
    "id": 97528,
    "release_date": 20020928,
    "pages": null,
    "format": "print",
    "lang": "ja",
    "locked": false,
    "hidden": false,
    "description": "",
    "title": ".hack// AI buster",
    "romaji": null,
    "isbn13": "9784044222048",
    "website": "https://sneakerbunko.jp/product/dothack/200206000136.html",
    "amazon": "https://www.amazon.co.jp/dp/4044222045",
    "bookwalker": null,
    "rakuten": null,
    "release_date_parsed": "2002-09-28",
    "duration": null,
    "image_id": 49346,
    "image": {"id": 49346, "width": 240, "height": 339, "spoiler": true, "nsfw": false, "filename": "syVVhiUZKMvK5aX0.jpg"},
    "publishers": [{"name": "KADOKAWA", "romaji": null, "publisher_type": "publisher", "id": 9}],
    "books": [{"id": 48857, "title": ".hack// AI buster", "title_orig": ".hack// AI buster", "romaji": null, "romaji_orig": null, "lang": "ja", "rtype": "complete", "sort_order": 1, "image": {"id": 49346, "width": 240, "height": 339, "spoiler": true, "nsfw": false, "filename": "syVVhiUZKMvK5aX0.jpg"}}],
    "user_list_release": null
  }
}`,
	staffResponse: `{
  "staff": [
    {"id": 3058, "lang": "ja", "name": "理不尽な孫の手", "romaji": "Rifujin na Magonote", "sim_score": 1}
  ],
  "count": "1",
  "currentPage": 1,
  "totalPages": 1
}`,
	staffOneResponse: `{
  "staff": {
    "id": 3058,
    "bookwalker_id": 19942,
    "wikidata_id": 104957419,
    "pixiv_id": null,
    "hidden": false,
    "locked": false,
    "twitter_id": "Magote_rihujin",
    "website": null,
    "description": "",
    "syosetu_id": 288399,
    "kakuyomu_id": null,
    "bsky_id": null,
    "bookwalker_gl_id": 56773,
    "bookwalker_gl_con_id": "CON_0RV79K9JV90G",
    "lang": "ja",
    "name": "理不尽な孫の手",
    "romaji": "Rifujin na Magonote",
    "aliases": [{"id": 12863, "staff_id": 3058, "main_alias": false, "name": "マゴノテ・ソード", "romaji": "Magonote Sword"}],
    "follow_count": null
  }
}`,
	publishersResponse: `{
  "publishers": [
    {"id": 43, "name": "Yen Audio", "romaji": null, "lang": "en", "sim_score": 1},
    {"id": 42, "name": "Yen On", "romaji": null, "lang": "en", "sim_score": 1}
  ],
  "count": "3",
  "currentPage": 1,
  "totalPages": 2
}`,
	publisherResponse: `{
  "publisher": {
    "id": 41,
    "wikidata_id": 2067115,
    "locked": false,
    "hidden": false,
    "name": "Yen Press",
    "romaji": null,
    "description": "Yen Press is an American publisher of Japanese manga and light novels translated into English. Aside from Japanese ligh…",
    "bookwalker": "https://bookwalker.com/browse?filter.publisher%5B%5D=PUB_2N9HR31N5XBG",
    "twitter_id": "yenpress",
    "website": "https://yenpress.com/",
    "aliases": "",
    "lang": "en",
    "child_publishers": [{"name": "Avocado House", "romaji": null, "id": 767, "relation_type": "imprint"}]
  }
}`,
	tagsResponse: `{
  "tags": [
    {"id": 7, "name": "fantasy", "ttype": "genre", "description": "", "count": "867"},
    {"id": 145, "name": "manga tie-in", "ttype": "tag", "description": "", "count": "806"},
    {"id": 26, "name": "anime tie-in", "ttype": "tag", "description": "", "count": "706"}
  ],
  "count": "169",
  "totalPages": 8,
  "currentPage": 1
}`,
	// GET /user/me requires authentication, so this shape is hand-written.
	userMeResponse: `{
  "id": "user_example",
  "username": "example-user",
  "id_numeric": 1234,
  "role": "user",
  "display_prefs": {"names": "romaji", "show_nsfw": false, "title_prefs": [{"lang": "en", "romaji": false, "official": "official"}, {"lang": "ja", "romaji": true, "official": "official"}], "descriptions": "en", "label_badge_display": true},
  "behavior_settings": {"reading_dates": {"auto_fill_started_date": false, "auto_fill_finished_date": false, "clear_dates_plan_to_read": false, "clear_dates_stalled_dropped_other": false}},
  "profile_image_filename": null,
  "private": false
}`,
};
