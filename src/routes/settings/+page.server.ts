import { lucia } from '$lib/server/lucia.js';
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
import { Argon2id } from 'oslo/password';
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
							])
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

		const validPassword = await new Argon2id().verify(user.hashed_password, password);
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
		const { request, locals, cookies } = event;
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

		const validPassword = await new Argon2id().verify(user.hashed_password, currentPassword);
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

		await lucia.invalidateUserSessions(user.id);
		const session = await lucia.createSession(user.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);

		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes,
		});

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

		const validPassword = await new Argon2id().verify(user.hashed_password, form.data.password);
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

		const validPassword = await new Argon2id().verify(
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
					.where('user_list_label.id', '>=', 11)
					.select([
						'user_list_label.id',
						'user_list_label.label',
						'user_list_label.private',
						'user_list_label.target',
					])
					.execute();
				const labels = listLabelsForm.data.labels;

				const labelsWithIds = labels.filter((v) => typeof v.id === 'number') as {
					id: number;
					label: string;
					target: 'both' | 'book' | 'series';
					private: boolean;
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
						.orderBy('id desc')
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
						})
						.execute();
				}

				for (const update of toUpdate) {
					await trx
						.updateTable('user_list_label')
						.set({
							label: update.label,
							target: update.target,
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
					return setError(
						listLabelsForm,
						'labels._errors',
						'Cannot have two labels with the same name. Please change one of the names.',
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
