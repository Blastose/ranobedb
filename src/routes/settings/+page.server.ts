import { superValidate, type Infer, type SuperValidated } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { db } from '$lib/server/db/db.js';
import { DBUsers } from '$lib/server/db/user/user.js';
import { defaultUserListSeriesSettings, type SettingsTab } from '$lib/db/dbConsts.js';
import {
	changeEmailSchema,
	deleteAccountSchema,
	displayPrefsSchema,
	homeDisplaySettingsSchema,
	passwordSchema,
	privacySettingsSchema,
	profilePictureSchema,
	removeProfilePictureSchema,
	sendEmailVerificationSchema,
	settingsTabsSchema,
	userListLabelsSchema,
	userListSeriesSettingsSchema,
	usernameSchema,
	verifyEmailSchema,
} from '$lib/server/zod/schema.js';
import { username, password, delete_account } from './actions/account';
import { displayprefs, homedisplaysettings, privacysettings } from './actions/display';
import { sendemailverificationcode, verifyemail, changeemail } from './actions/email';
import {
	serieslistsettings,
	serieslistsettingsapplyall,
	listlabels,
} from './actions/list-settings';
import { refreshpat } from './actions/pat';
import { profilepicture, removeprofilepicture } from './actions/profile-image';
import type { Actions } from './$types';

type SettingsWithoutUser = {
	type: 'no-user';
};
type SettingsWithUser = {
	type: 'user';
	email_verified: boolean;
	usernameForm: SuperValidated<Infer<typeof usernameSchema>>;
	passwordForm: SuperValidated<Infer<typeof passwordSchema>>;
	deleteAccountForm: SuperValidated<Infer<typeof deleteAccountSchema>>;
	verifyEmailForm: SuperValidated<Infer<typeof verifyEmailSchema>>;
	sendEmailVerificationForm: SuperValidated<Infer<typeof sendEmailVerificationSchema>>;
	changeEmailForm: SuperValidated<Infer<typeof changeEmailSchema>>;
	displayPrefsForm: SuperValidated<Infer<typeof displayPrefsSchema>>;
	profilePictureForm: SuperValidated<Infer<typeof profilePictureSchema>>;
	removeProfilePictureForm: SuperValidated<Infer<typeof removeProfilePictureSchema>>;
	userListSeriesSettingsForm: SuperValidated<Infer<typeof userListSeriesSettingsSchema>>;
	homeDisplaySettingsForm: SuperValidated<Infer<typeof homeDisplaySettingsSchema>>;
	listLabelsForm: SuperValidated<Infer<typeof userListLabelsSchema>>;
	privacySettingsForm: SuperValidated<Infer<typeof privacySettingsSchema>>;
	view: SettingsTab;
	personalAccessToken: string;
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

	const patRecord = await db
		.selectFrom('auth_user_personal_access_token')
		.where('user_id', '=', locals.user.id)
		.select('personal_access_token')
		.executeTakeFirst();

	const usernameForm = await superValidate(
		{
			username: locals.user.username,
		},
		zod4(usernameSchema),
	);
	const passwordForm = await superValidate(zod4(passwordSchema));
	const deleteAccountForm = await superValidate(zod4(deleteAccountSchema));
	const changeEmailForm = await superValidate(
		{ current_email: user.email },
		zod4(changeEmailSchema),
		{ errors: false },
	);
	const verifyEmailForm = await superValidate(zod4(verifyEmailSchema));
	const sendEmailVerificationForm = await superValidate(zod4(sendEmailVerificationSchema));
	const displayPrefsForm = await superValidate(locals.user.display_prefs, zod4(displayPrefsSchema));
	const profilePictureForm = await superValidate(
		{ current_filename: locals.user.profile_image_filename },
		zod4(profilePictureSchema),
	);
	const removeProfilePictureForm = await superValidate(
		{ current_filename: locals.user.profile_image_filename },
		zod4(removeProfilePictureSchema),
	);
	const homeDisplaySettingsForm = await superValidate(
		(
			await db
				.selectFrom('auth_user')
				.where('auth_user.id', '=', locals.user.id)
				.select('auth_user.home_display_settings')
				.executeTakeFirstOrThrow()
		).home_display_settings,
		zod4(homeDisplaySettingsSchema),
	);
	const settingsTabs = await superValidate(url, zod4(settingsTabsSchema));
	const userListSeriesSettingsForm =
		settingsTabs.data.view === 'list'
			? await superValidate(
					(await dbUsers.getListPrefs(locals.user.id)).default_series_settings,
					zod4(userListSeriesSettingsSchema),
				)
			: await superValidate(defaultUserListSeriesSettings, zod4(userListSeriesSettingsSchema));
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
					zod4(userListLabelsSchema),
				)
			: await superValidate({}, zod4(userListLabelsSchema));
	const privacySettingsForm = await superValidate(
		{ private: locals.user.private },
		zod4(privacySettingsSchema),
	);

	return {
		type: 'user',
		email_verified: user.email_verified,
		usernameForm,
		passwordForm,
		deleteAccountForm,
		changeEmailForm,
		verifyEmailForm,
		sendEmailVerificationForm,
		displayPrefsForm,
		userListSeriesSettingsForm,
		profilePictureForm,
		removeProfilePictureForm,
		homeDisplaySettingsForm,
		listLabelsForm,
		privacySettingsForm,
		view: settingsTabs.data.view,
		personalAccessToken: patRecord?.personal_access_token ?? '',
	} satisfies SettingsLoad;
};

export const actions = {
	username,
	password,
	delete_account,
	displayprefs,
	serieslistsettings,
	serieslistsettingsapplyall,
	sendemailverificationcode,
	verifyemail,
	changeemail,
	listlabels,
	profilepicture,
	removeprofilepicture,
	homedisplaysettings,
	refreshpat,
	privacysettings,
} satisfies Actions;
