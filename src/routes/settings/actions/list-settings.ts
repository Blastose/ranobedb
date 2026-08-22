import pkg from 'pg';
import { sql } from 'kysely';
import { fail, message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { db } from '$lib/server/db/db.js';
import { arrayDiff, arrayIntersection } from '$lib/db/array.js';
import { userListLabelsSchema, userListSeriesSettingsSchema } from '$lib/server/zod/schema.js';
import type { RequestEvent } from '../$types';

const { DatabaseError } = pkg;

// TODO - Note that this should be sql safe from injections since the langs and formats are valdiated by zod before
// We use raw sql because Kysely doesn't support CROSS JOIN's
function buildCrossJoinInsertQuery(
	target: 'user_list_series_lang' | 'user_list_series_format',
	values: string[],
	userId: string,
): string {
	const alias = target === 'user_list_series_lang' ? 'lang' : 'fmt';
	const cast = target === 'user_list_series_lang' ? 'language' : 'release_format';
	const column = target === 'user_list_series_lang' ? 'lang' : 'format';
	return `
WITH
	"uls" AS (
		SELECT
			"user_list_series"."series_id",
			"user_list_series"."user_id",
			${alias}
		FROM
			"user_list_series"
		CROSS JOIN (VALUES ${values.map((v) => `('${v}')`).join(', ')}) AS ${alias}(${alias})
		WHERE
			"user_list_series"."user_id" = '${userId}'
	)
INSERT INTO
	"${target}" ("${column}", "series_id", "user_id")
SELECT
	"uls"."${alias}"::${cast} AS "lang",
	"uls"."series_id" AS "series_id",
	"uls"."user_id" AS "user_id"
FROM
	"uls"
`;
}

export const serieslistsettings = async ({ request, locals }: RequestEvent) => {
	if (!locals.user) return fail(401);
	const userListSeriesSettingsForm = await superValidate(
		request,
		zod4(userListSeriesSettingsSchema),
	);
	if (!userListSeriesSettingsForm.valid) {
		return fail(400, { userListSeriesSettingsForm });
	}

	await db
		.updateTable('user_list_settings')
		.set({
			default_series_settings: JSON.stringify(userListSeriesSettingsForm.data),
		})
		.where('user_id', '=', locals.user.id)
		.execute();

	return message(userListSeriesSettingsForm, {
		text: 'Updated series list preferences!',
		type: 'success',
	});
};

export const serieslistsettingsapplyall = async ({ request, locals }: RequestEvent) => {
	if (!locals.user) return fail(401);
	const userListSeriesSettingsForm = await superValidate(
		request,
		zod4(userListSeriesSettingsSchema),
	);
	if (!userListSeriesSettingsForm.valid) {
		return fail(400, { userListSeriesSettingsForm });
	}

	const user = locals.user;
	const data = userListSeriesSettingsForm.data;

	await db.transaction().execute(async (trx) => {
		await trx
			.updateTable('user_list_settings')
			.set({
				default_series_settings: JSON.stringify(userListSeriesSettingsForm.data),
			})
			.where('user_id', '=', user.id)
			.execute();

		await trx
			.updateTable('user_list_series')
			.set({
				show_upcoming: data.show_upcoming,
				notify_book: data.show_upcoming && data.notify_book,
				notify_when_released: data.show_upcoming && data.notify_when_released,
			})
			.where('user_list_series.user_id', '=', user.id)
			.execute();

		await trx
			.deleteFrom('user_list_series_lang')
			.where('user_list_series_lang.user_id', '=', user.id)
			.execute();
		await trx
			.deleteFrom('user_list_series_format')
			.where('user_list_series_format.user_id', '=', user.id)
			.execute();

		if (data.langs.length > 0) {
			const langsQuery = buildCrossJoinInsertQuery('user_list_series_lang', data.langs, user.id);
			await sql(langsQuery as unknown as TemplateStringsArray).execute(trx);
		}

		if (data.formats.length > 0) {
			const formatsQuery = buildCrossJoinInsertQuery(
				'user_list_series_format',
				data.formats,
				user.id,
			);
			await sql(formatsQuery as unknown as TemplateStringsArray).execute(trx);
		}
	});

	return message(userListSeriesSettingsForm, {
		text: 'Applied series list preferences to all series in list!',
		type: 'success',
	});
};

export const listlabels = async (event: RequestEvent) => {
	const { locals, request } = event;
	const user = locals.user;
	if (!user) {
		return fail(401);
	}

	const formData = await request.formData();

	const listLabelsForm = await superValidate(formData, zod4(userListLabelsSchema));

	if (!listLabelsForm.valid) {
		return message(
			listLabelsForm,
			{ type: 'error', text: 'Invalid custom label entries.' },
			{ status: 400 },
		);
	}

	try {
		await db.transaction().execute(async (trx) => {
			const currentLabels = await trx
				.selectFrom('user_list_label')
				.where('user_list_label.user_id', '=', user.id)
				.where('user_list_label.id', '>', 10)
				.select([
					'user_list_label.id',
					'user_list_label.label',
					'user_list_label.private',
					'user_list_label.target',
					'user_list_label.sort_order',
				])
				.execute();
			const labels = listLabelsForm.data.labels
				.map((v, i) => ({ ...v, sort_order: i }))
				.filter((v) => {
					// Filter for custom labels only
					if (v.id) {
						return v.id > 10;
					}
					return true;
				});

			const labelsWithIds = labels.filter((v) => typeof v.id === 'number') as {
				id: number;
				label: string;
				target: 'both' | 'book' | 'series';
				private: boolean;
				sort_order: number;
			}[];
			const toAdd = labels.filter((v) => typeof v.id !== 'number');
			const toRemove = arrayDiff(currentLabels, labelsWithIds);
			const toUpdate = arrayIntersection(labelsWithIds, currentLabels);

			for (const remove of toRemove) {
				await trx
					.deleteFrom('user_list_book_label')
					.where('user_list_book_label.user_id', '=', user.id)
					.where('user_list_book_label.label_id', '=', remove.id)
					.execute();
				await trx
					.deleteFrom('user_list_series_label')
					.where('user_list_series_label.user_id', '=', user.id)
					.where('user_list_series_label.label_id', '=', remove.id)
					.execute();
				await trx
					.deleteFrom('user_list_label')
					.where('user_list_label.user_id', '=', user.id)
					.where('user_list_label.id', '=', remove.id)
					.execute();
			}

			for (const add of toAdd) {
				// TODO This is pretty bad TBH because it needs to make a query to get the current highest label id
				const highestLabelInList = await trx
					.selectFrom('user_list_label')
					.where('user_list_label.user_id', '=', user.id)
					.where('user_list_label.id', '>', 10)
					.orderBy('id', 'desc')
					.select('id')
					.executeTakeFirst();
				const highestLabelId = (highestLabelInList?.id || 10) + 1;

				await trx
					.insertInto('user_list_label')
					.values({
						id: highestLabelId,
						label: add.label,
						private: false,
						user_id: user.id,
						target: add.target,
						sort_order: add.sort_order,
					})
					.execute();
			}

			for (const update of toUpdate) {
				await trx
					.updateTable('user_list_label')
					.set({
						label: update.label,
						target: update.target,
						sort_order: update.sort_order,
					})
					.where('user_list_label.id', '=', update.id)
					.where('user_list_label.user_id', '=', user.id)
					.execute();
			}
		});
	} catch (e) {
		if (e instanceof DatabaseError) {
			if (
				e.code === '23505' &&
				e.table === 'user_list_label' &&
				e.constraint === 'user_list_label_user_id_label_key'
			) {
				return message(
					listLabelsForm,
					{
						type: 'error',
						text: 'Cannot have two labels with the same name. Please change one of the names.',
					},
					{ status: 400 },
				);
			}
		}
		return message(
			listLabelsForm,
			{ type: 'error', text: 'An unexpected error has occurred. Please inform the developer.' },
			{ status: 400 },
		);
	}

	return message(listLabelsForm, {
		text: 'Saved custom labels successfully!',
		type: 'success',
	});
};
