import { lucia } from '$lib/server/lucia.js';
import { displayPrefsSchema, passwordSchema, usernameSchema } from '$lib/server/zod/schema.js';
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
const { DatabaseError } = pkg;

type SettingsWithoutUser = {
	type: 'no-user';
};
type SettingsWithUser = {
	type: 'user';
	usernameForm: SuperValidated<Infer<typeof usernameSchema>>;
	passwordForm: SuperValidated<Infer<typeof passwordSchema>>;
	displayPrefsForm: SuperValidated<Infer<typeof displayPrefsSchema>>;
	view: 'account' | 'display';
};
type SettingsLoad = SettingsWithoutUser | SettingsWithUser;

export const load = async ({ locals, url }) => {
	if (!locals.user) {
		return {
			type: 'no-user',
		} satisfies SettingsLoad;
	}

	const usernameForm = await superValidate(
		{
			username: locals.user.username,
		},
		zod(usernameSchema),
	);

	const passwordForm = await superValidate(zod(passwordSchema));
	const displayPrefsForm = await superValidate(locals.user.display_prefs, zod(displayPrefsSchema));

	return {
		type: 'user',
		usernameForm,
		passwordForm,
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
			return message(
				passwordForm,
				{ type: 'error', text: 'Invalid login credentials' },
				{ status: 400 },
			);
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
};
