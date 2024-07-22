import { sql, type Kysely } from 'kysely';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(trx: Kysely<any>): Promise<void> {
	const user_list_series = await sql<{
		series_id: number;
		user_id: string;
		series_id_in_list: number | null;
		langs: string[];
	}>`
SELECT sb.series_id,
       ulb.user_id,
       uls.series_id AS series_id_in_list,
       array_agg(DISTINCT r.lang)::text[] AS langs
FROM user_list_book ulb
INNER JOIN series_book sb ON sb.book_id = ulb.book_id
INNER JOIN release_book rb ON rb.book_id = sb.book_id
INNER JOIN release r ON r.id = rb.release_id
LEFT JOIN user_list_series uls ON uls.series_id = sb.series_id
AND uls.user_id = ulb.user_id
WHERE uls.series_id is null
GROUP BY sb.series_id,
         ulb.user_id,
         uls.series_id
ORDER BY sb.series_id
`.execute(trx);

	for (const row of user_list_series.rows) {
		const defaultUserListSeriesSettings = {
			formats: [],
			langs: ['en'],
			notify_book: false,
			readingStatus: 'Reading',
			show_upcoming: true,
		};
		await trx
			.insertInto('user_list_series')
			.values({
				notify_book: false,
				show_upcoming: defaultUserListSeriesSettings.show_upcoming,
				series_id: row.series_id,
				user_id: row.user_id,
				volumes_read: null,
			})
			.execute();
		if (row.langs.length === 1 && row.langs[0] === 'ja') {
			defaultUserListSeriesSettings.langs = ['ja'];
		}
		const userListSeriesLangs = defaultUserListSeriesSettings.langs.map((v) => ({
			lang: v,
			series_id: row.series_id,
			user_id: row.user_id,
		}));
		if (userListSeriesLangs.length > 0) {
			await trx.insertInto('user_list_series_lang').values(userListSeriesLangs).execute();
		}
		const userListSeriesFormats = [].map((v) => ({
			format: v,
			series_id: row.series_id,
			user_id: row.user_id,
		}));
		if (userListSeriesFormats.length > 0) {
			await trx.insertInto('user_list_series_format').values(userListSeriesFormats).execute();
		}
		const labelIds = [1];
		const userListSeriesLabels = labelIds.map((labelId) => {
			return {
				series_id: row.series_id,
				user_id: row.user_id,
				label_id: labelId,
			};
		});
		if (userListSeriesLabels.length > 0) {
			await trx.insertInto('user_list_series_label').values(userListSeriesLabels).execute();
		}
	}
}
