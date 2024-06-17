import { lucia } from '$lib/server/lucia.js';
import {
	changeEmailSchema,
	displayPrefsSchema,
	passwordSchema,
	sendEmailVerificationSchema,
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
	view: 'account' | 'display' | 'email';
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
	const changeEmailForm = await superValidate({ new_email: user.email }, zod(changeEmailSchema));
	const verifyEmailForm = await superValidate(zod(verifyEmailSchema));
	const sendEmailVerificationForm = await superValidate(zod(sendEmailVerificationSchema));
	const displayPrefsForm = await superValidate(locals.user.display_prefs, zod(displayPrefsSchema));

	return {
		type: 'user',
		email_verified: user.email_verified,
		usernameForm,
		passwordForm,
		changeEmailForm,
		verifyEmailForm,
		sendEmailVerificationForm,
		displayPrefsForm,
		view: (url.searchParams.get('view') as 'account' | 'display') || 'account',
	} satisfies SettingsLoad;
};

export const actions = {
	username: async ({ request, locals }) => {
		if (!locals.user) return fail(401);

		const usernameForm = await superValidate(request, zod(usernameSchema));

		if (!usernameForm.valid) return fail(400, { usernameForm });

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

	password: async ({ request, locals, cookies }) => {
		if (!locals.user) return fail(401);

		const passwordForm = await superValidate(request, zod(passwordSchema));
		if (!passwordForm.valid) return fail(400, { passwordForm });

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
		if (!displayPrefsForm.valid) return fail(400, { displayPrefsForm });

		const dbUsers = new DBUsers(db);
		await dbUsers.updateDisplayPrefs({
			userId: locals.user.id,
			displayPrefs: displayPrefsForm.data,
		});

		return message(displayPrefsForm, { text: 'Updated display preferences!', type: 'success' });
	},

	sendemailverificationcode: async ({ request, locals }) => {
		if (!locals.user) return fail(401);

		const formData = await request.formData();

		const form = await superValidate(formData, zod(sendEmailVerificationSchema));
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

		const emailVerification = new EmailVerification(db);
		const code = await emailVerification.generateEmailVerificationCode(locals.user.id, user.email);
		await emailVerification.sendVerificationCode(user.email, code);

		return message(form, {
			text: 'Sent a verification code to your email address!',
			type: 'success',
		});
	},

	verifyemail: async ({ request, locals }) => {
		if (!locals.user) return fail(401);

		const verifyEmailForm = await superValidate(request, zod(verifyEmailSchema));
		if (!verifyEmailForm.valid) return fail(400, { verifyEmailForm });

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

	changeemail: async () => {
		return fail(400);
		// TODO
		// if (!locals.user) return fail(401);

		// const formData = await request.formData();

		// const changeEmailForm = await superValidate(formData, zod(changeEmailSchema));

		// const turnstileSuccess = await validateTurnstile({ request, body: formData });
		// if (!turnstileSuccess) {
		// 	return fail(400, { changeEmailForm });
		// }

		// if (!changeEmailForm.valid) return fail(400, { changeEmailForm });

		// const dbUsers = new DBUsers(db);

		// const user = await dbUsers.getUserFull(locals.user.username);

		// if (!user) {
		// 	return message(changeEmailForm, { type: 'error', text: 'Error' }, { status: 400 });
		// }

		// const validPassword = await new Argon2id().verify(
		// 	user.hashed_password,
		// 	changeEmailForm.data.password,
		// );
		// if (!validPassword) {
		// 	return message(changeEmailForm, { type: 'error', text: 'Invalid password' }, { status: 400 });
		// }

		// return message(changeEmailForm, {
		// 	text: 'Sent an email to new email address!',
		// 	type: 'success',
		// });
	},
};
