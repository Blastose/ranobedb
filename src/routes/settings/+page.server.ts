import {
	changeEmailSchema,
	displayPrefsSchema,
	passwordSchema,
	sendEmailVerificationSchema,
	settingsTabsSchema,
	userListLabelsSchema,
	userListSeriesSettingsSchema,
	usernameSchema,
	verifyEmailSchema,
} from '$lib/server/zod/schema.js';
import {
	fail,
	message,
	setError,
	superValidate,
	type Infer,
	type SuperValidated,
} from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import pkg from 'pg';
import { db } from '$lib/server/db/db.js';
import { DBUsers } from '$lib/server/db/user/user.js';
import { validateTurnstile } from '$lib/server/cf.js';
import { EmailVerification } from '$lib/server/email/email.js';
import { ORIGIN } from '$env/static/private';
import { defaultUserListSeriesSettings, type SettingsTab } from '$lib/db/dbConsts.js';
import {
	changeEmailLimiter,
	changePasswordLimiter,
	isLimited,
	sendVerificationCodelimiter,
	verifyCodeLimiter,
} from '$lib/server/rate-limiter/rate-limiter.js';
import { getMode } from '$lib/mode/mode.js';
import { arrayDiff, arrayIntersection } from '$lib/db/array.js';
import { sql } from 'kysely';
import { Lucia } from '$lib/server/lucia/lucia.js';
import { verifyPasswordHash } from '$lib/server/password/hash.js';
const { DatabaseError } = pkg;

type SettingsWithoutUser = {
	type: 'no-user';
};
type SettingsWithUser = {
	type: 'user';
	email_verified: boolean;
	usernameForm: SuperValidated<Infer<typeof usernameSchema>>;
	passwordForm: SuperValidated<Infer<typeof passwordSchema>>;
	verifyEmailForm: SuperValidated<Infer<typeof verifyEmailSchema>>;
	sendEmailVerificationForm: SuperValidated<Infer<typeof sendEmailVerificationSchema>>;
	changeEmailForm: SuperValidated<Infer<typeof changeEmailSchema>>;
	displayPrefsForm: SuperValidated<Infer<typeof displayPrefsSchema>>;
	userListSeriesSettingsForm: SuperValidated<Infer<typeof userListSeriesSettingsSchema>>;
	listLabelsForm: SuperValidated<Infer<typeof userListLabelsSchema>>;
	view: SettingsTab;
};
type SettingsLoad = SettingsWithoutUser | SettingsWithUser;

export const load = async ({ locals, url }) => {
	if (!locals.user) {
		return {
			type: 'no-user',
		} satisfies SettingsLoad;
	}

	const dbUsers = new DBUsers(db);
	const user = await dbUsers.getEmail(locals.user.id);

	const usernameForm = await superValidate(
		{
			username: locals.user.username,
		},
		zod(usernameSchema),
	);
	const passwordForm = await superValidate(zod(passwordSchema));
	const changeEmailForm = await superValidate(
		{ current_email: user.email },
		zod(changeEmailSchema),
		{ errors: false },
	);
	const verifyEmailForm = await superValidate(zod(verifyEmailSchema));
	const sendEmailVerificationForm = await superValidate(zod(sendEmailVerificationSchema));
	const displayPrefsForm = await superValidate(locals.user.display_prefs, zod(displayPrefsSchema));
	const settingsTabs = await superValidate(url, zod(settingsTabsSchema));
	const userListSeriesSettingsForm =
		settingsTabs.data.view === 'list'
			? await superValidate(
					(await dbUsers.getListPrefs(locals.user.id)).default_series_settings,
					zod(userListSeriesSettingsSchema),
				)
			: await superValidate(defaultUserListSeriesSettings, zod(userListSeriesSettingsSchema));
	const listLabelsForm =
		settingsTabs.data.view === 'list'
			? await superValidate(
					{
						labels: await db
							.selectFrom('user_list_label')
							.where('user_list_label.user_id', '=', locals.user.id)
							.where('user_list_label.id', '>=', 11)
							.select([
								'user_list_label.id',
								'user_list_label.label',
								'user_list_label.private',
								'user_list_label.target',
								'user_list_label.sort_order',
							])
							.orderBy('user_list_label.sort_order', 'asc')
							.execute(),
					},
					zod(userListLabelsSchema),
				)
			: await superValidate({}, zod(userListLabelsSchema));

	return {
		type: 'user',
		email_verified: user.email_verified,
		usernameForm,
		passwordForm,
		changeEmailForm,
		verifyEmailForm,
		sendEmailVerificationForm,
		displayPrefsForm,
		userListSeriesSettingsForm,
		listLabelsForm,
		view: settingsTabs.data.view,
	} satisfies SettingsLoad;
};

export const actions = {
	username: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401);
		}

		const usernameForm = await superValidate(request, zod(usernameSchema));

		if (!usernameForm.valid) {
			return fail(400, { usernameForm });
		}

		const newUsername = usernameForm.data.username;
		const password = usernameForm.data.password;
		const dbUsers = new DBUsers(db);

		const user = await dbUsers.getUserFull(locals.user.username);
		if (!user) {
			return message(
				usernameForm,
				{ type: 'error', text: 'Invalid login credentials' },
				{ status: 400 },
			);
		}

		const validPassword = await verifyPasswordHash(user.hashed_password, password);
		if (!validPassword) {
			return message(usernameForm, { type: 'error', text: 'Invalid password' }, { status: 400 });
		}

		try {
			await dbUsers.changeUsername({
				userId: user.id,
				newUsername,
			});
		} catch (error) {
			if (error instanceof DatabaseError) {
				if (
					error.code === '23505' &&
					(error.detail?.includes('Key (username)') ||
						error.detail?.includes('Key (username_lowercase)'))
				) {
					setError(
						usernameForm,
						'username',
						'Username is already in use. Please use a different username',
					);
					return message(
						usernameForm,
						{ type: 'error', text: 'Invalid form entries' },
						{ status: 400 },
					);
				}
			}
			return message(
				usernameForm,
				{ type: 'error', text: 'An unknown error has occurred' },
				{ status: 500 },
			);
		}

		return message(usernameForm, { text: 'Updated username!', type: 'success' });
	},

	password: async (event) => {
		const { request, locals } = event;
		if (!locals.user) {
			return fail(401);
		}

		const passwordForm = await superValidate(request, zod(passwordSchema));
		if (!passwordForm.valid) {
			return fail(400, { passwordForm });
		}

		const dbUsers = new DBUsers(db);

		const user = await dbUsers.getUserFull(locals.user.username);
		if (!user) {
			return message(passwordForm, { type: 'error', text: 'Error' }, { status: 400 });
		}

		const currentPassword = passwordForm.data.currentPassword;
		const newPassword = passwordForm.data.newPassword;

		const validPassword = await verifyPasswordHash(user.hashed_password, currentPassword);
		if (!validPassword) {
			return message(passwordForm, { type: 'error', text: 'Invalid password' }, { status: 400 });
		}

		if (await isLimited(changePasswordLimiter, event)) {
			return message(
				passwordForm,
				{ type: 'error', text: 'Too many password change attempts; Try again in 1 minute' },
				{ status: 429 },
			);
		}

		await dbUsers.changePassword({ userId: user.id, newPassword });
		const lucia = new Lucia(db);
		const token = lucia.generateSessionToken();
		const session = await lucia.createSession(token, user.id);
		lucia.setSessionTokenCookie(event, token, session.expiresAt);

		return message(passwordForm, { text: 'Updated password!', type: 'success' });
	},

	displayprefs: async ({ request, locals }) => {
		if (!locals.user) return fail(401);

		const displayPrefsForm = await superValidate(request, zod(displayPrefsSchema));
		if (!displayPrefsForm.valid) {
			return fail(400, { displayPrefsForm });
		}

		const dbUsers = new DBUsers(db);
		await dbUsers.updateDisplayPrefs({
			userId: locals.user.id,
			displayPrefs: displayPrefsForm.data,
		});

		return message(displayPrefsForm, { text: 'Updated display preferences!', type: 'success' });
	},

	serieslistsettings: async ({ request, locals }) => {
		if (!locals.user) return fail(401);
		const userListSeriesSettingsForm = await superValidate(
			request,
			zod(userListSeriesSettingsSchema),
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
	},

	serieslistsettingsapplyall: async ({ request, locals }) => {
		if (!locals.user) return fail(401);
		const userListSeriesSettingsForm = await superValidate(
			request,
			zod(userListSeriesSettingsSchema),
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

			// TODO - Note that this should be sql safe from injections since the langs and formats are valdiated by zod before
			// We use raw sql because Kysely doesn't support CROSS JOIN's
			if (data.langs.length > 0) {
				const langsQuery = `
				WITH
					"uls" AS (
						SELECT
							"user_list_series"."series_id",
							"user_list_series"."user_id",
							lang
						FROM
							"user_list_series"
						CROSS JOIN (VALUES ${data.langs.map((v) => `('${v}')`).join(', ')}) AS lang(lang)
						WHERE
							"user_list_series"."user_id" = '${user.id}'
					)
				INSERT INTO
					"user_list_series_lang" ("lang", "series_id", "user_id")
				SELECT
					"uls"."lang"::language AS "lang",
					"uls"."series_id" AS "series_id",
					"uls"."user_id" AS "user_id"
				FROM
					"uls"
				`;
				await sql(langsQuery as unknown as TemplateStringsArray).execute(trx);
			}

			if (data.formats.length > 0) {
				const formatsQuery = `
				WITH
					"uls" AS (
						SELECT
							"user_list_series"."series_id",
							"user_list_series"."user_id",
							fmt
						FROM
							"user_list_series"
						CROSS JOIN (VALUES ${data.formats.map((v) => `('${v}')`).join(', ')}) AS fmt(fmt)
						WHERE
							"user_list_series"."user_id" = '${user.id}'
					)
				INSERT INTO
					"user_list_series_format" ("format", "series_id", "user_id")
				SELECT
					"uls"."fmt"::release_format AS "lang",
					"uls"."series_id" AS "series_id",
					"uls"."user_id" AS "user_id"
				FROM
					"uls"
				`;
				await sql(formatsQuery as unknown as TemplateStringsArray).execute(trx);
			}
		});

		return message(userListSeriesSettingsForm, {
			text: 'Applied series list preferences to all series in list!',
			type: 'success',
		});
	},

	sendemailverificationcode: async (event) => {
		const { request, locals } = event;
		if (!locals.user) return fail(401);

		const formData = await request.formData();

		const form = await superValidate(formData, zod(sendEmailVerificationSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		const turnstileSuccess = await validateTurnstile({ request, body: formData });
		if (!turnstileSuccess) {
			return fail(400);
		}

		const dbUsers = new DBUsers(db);
		const user = await dbUsers.getUserFull(locals.user.username);

		if (!user) {
			return fail(401);
		}

		if (user.email_verified) {
			return fail(401);
		}

		const validPassword = await verifyPasswordHash(user.hashed_password, form.data.password);
		if (!validPassword) {
			return message(form, { type: 'error', text: 'Invalid password' }, { status: 400 });
		}

		if (await isLimited(sendVerificationCodelimiter, event)) {
			return message(
				form,
				{ type: 'error', text: 'Too many email code attempts; Try again later' },
				{ status: 429 },
			);
		}

		const emailVerification = new EmailVerification(db);
		const code = await emailVerification.generateEmailVerificationCode(locals.user.id, user.email);
		await emailVerification.sendVerificationCodeEmail({
			email: user.email,
			verificationCode: code,
			username: user.username,
		});

		return message(form, {
			text: 'Sent a verification code to your email address!',
			type: 'success',
		});
	},

	verifyemail: async (event) => {
		const { request, locals } = event;
		if (!locals.user) {
			return fail(401);
		}

		const verifyEmailForm = await superValidate(request, zod(verifyEmailSchema));
		if (!verifyEmailForm.valid) {
			return fail(400, { verifyEmailForm });
		}

		if (await isLimited(verifyCodeLimiter, event)) {
			return message(
				verifyEmailForm,
				{ type: 'error', text: 'Too many verify code attempts; Try again later' },
				{ status: 429 },
			);
		}

		const emailVerification = new EmailVerification(db);

		const validCode = await emailVerification.verifyVerificationCode(
			locals.user,
			verifyEmailForm.data.code,
		);
		if (!validCode) {
			return message(verifyEmailForm, { text: 'Invalid code!', type: 'error' }, { status: 401 });
		}

		await emailVerification.setUserEmailStatusToVerified(locals.user);

		return message(verifyEmailForm, { text: 'Verified email!', type: 'success' });
	},

	changeemail: async (event) => {
		const { locals, request } = event;
		if (!locals.user) {
			return fail(401);
		}

		const formData = await request.formData();

		const changeEmailForm = await superValidate(formData, zod(changeEmailSchema));

		const turnstileSuccess = await validateTurnstile({ request, body: formData });
		if (!turnstileSuccess) {
			return fail(400, { changeEmailForm });
		}

		if (!changeEmailForm.valid) {
			return fail(400, { changeEmailForm });
		}

		const dbUsers = new DBUsers(db);

		const user = await dbUsers.getUserFull(locals.user.username);

		if (!user) {
			return message(changeEmailForm, { type: 'error', text: 'Error' }, { status: 400 });
		}

		if (user.email === changeEmailForm.data.new_email) {
			return message(
				changeEmailForm,
				{ type: 'error', text: 'New email cannot be the same as current email' },
				{ status: 400 },
			);
		}

		const validPassword = await verifyPasswordHash(
			user.hashed_password,
			changeEmailForm.data.password,
		);
		if (!validPassword) {
			return message(
				changeEmailForm,
				{ type: 'error', text: 'Invalid credentials!' },
				{ status: 400 },
			);
		}

		if (user.email !== changeEmailForm.data.current_email) {
			return message(
				changeEmailForm,
				{ type: 'error', text: 'Invalid credentials!' },
				{ status: 400 },
			);
		}

		if (await isLimited(changeEmailLimiter, event)) {
			return message(
				changeEmailForm,
				{ type: 'error', text: 'Too many change email attempts; Try again later' },
				{ status: 429 },
			);
		}

		const emailVerification = new EmailVerification(db);
		const verificationToken = await emailVerification.createEmailVerificationToken(
			user.user_id,
			changeEmailForm.data.new_email,
		);
		const verificationLink = ORIGIN + '/email-verification?token=' + verificationToken;

		if (getMode() !== 'production') {
			console.log(verificationLink);
		} else {
			await emailVerification.sendVerificationTokenUrlEmail({
				email: changeEmailForm.data.new_email,
				username: user.username,
				verificationTokenUrl: verificationLink,
			});
		}

		return message(changeEmailForm, {
			text: 'Sent an email to new email address!',
			type: 'success',
		});
	},

	listlabels: async (event) => {
		const { locals, request } = event;
		const user = locals.user;
		if (!user) {
			return fail(401);
		}

		const formData = await request.formData();

		const listLabelsForm = await superValidate(formData, zod(userListLabelsSchema));

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
	},
};
