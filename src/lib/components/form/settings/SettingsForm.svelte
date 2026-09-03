<script lang="ts">
	import SidebarListItem from '$lib/components/layout/sidebar/SidebarListItem.svelte';
	import { page } from '$app/state';
	import UsernameForm from './UsernameForm.svelte';
	import type {
		changeEmailSchema,
		deleteAccountSchema,
		displayPrefsSchema,
		homeDisplaySettingsSchema,
		passwordSchema,
		profilePictureSchema,
		removeProfilePictureSchema,
		sendEmailVerificationSchema,
		userListLabelsSchema,
		userListSeriesSettingsSchema,
		usernameSchema,
		verifyEmailSchema,
		privacySettingsSchema,
		behaviorSettingsSchema,
	} from '$lib/server/zod/schema';
	import type { Infer, SuperValidated } from 'sveltekit-superforms';
	import PasswordForm from './PasswordForm.svelte';
	import DisplayPrefsForm from './DisplayPrefsForm.svelte';
	import ThemeSelect from './ThemeSelect.svelte';
	import Hr from '$lib/components/layout/Hr.svelte';
	import ChangeEmailForm from './email/ChangeEmailForm.svelte';
	import VerifyEmailForm from './email/VerifyEmailForm.svelte';
	import type { SettingsTab } from '$lib/db/dbConsts';
	import SeriesListSettingsForm from './list/SeriesListSettingsForm.svelte';
	import ListLabelsForm from './list/ListLabelsForm.svelte';
	import ProfilePictureForm from './picture/ProfilePictureForm.svelte';
	import RemoveProfilePictureForm from './picture/RemoveProfilePictureForm.svelte';
	import HomeDisplayForm from './HomeDisplayForm.svelte';
	import DeleteAccountForm from './DeleteAccountForm.svelte';
	import PersonalAccessTokenForm from './PersonalAccessTokenForm.svelte';
	import PrivacySettingsForm from './PrivacySettingsForm.svelte';
	import BehaviorPrefsForm from './BehaviorPrefsForm.svelte';

	interface Props {
		email_verified: boolean;
		usernameForm: SuperValidated<Infer<typeof usernameSchema>>;
		passwordForm: SuperValidated<Infer<typeof passwordSchema>>;
		deleteAccountForm: SuperValidated<Infer<typeof deleteAccountSchema>>;
		verifyEmailForm: SuperValidated<Infer<typeof verifyEmailSchema>>;
		sendEmailVerificationForm: SuperValidated<Infer<typeof sendEmailVerificationSchema>>;
		changeEmailForm: SuperValidated<Infer<typeof changeEmailSchema>>;
		displayPrefsForm: SuperValidated<Infer<typeof displayPrefsSchema>>;
		behaviorPrefsForm: SuperValidated<Infer<typeof behaviorSettingsSchema>>;
		userListSeriesSettingsForm: SuperValidated<Infer<typeof userListSeriesSettingsSchema>>;
		profilePictureForm: SuperValidated<Infer<typeof profilePictureSchema>>;
		removeProfilePictureForm: SuperValidated<Infer<typeof removeProfilePictureSchema>>;
		homeDisplaySettingsForm: SuperValidated<Infer<typeof homeDisplaySettingsSchema>>;
		listLabelsForm: SuperValidated<Infer<typeof userListLabelsSchema>>;
		privacySettingsForm: SuperValidated<Infer<typeof privacySettingsSchema>>;
		view: SettingsTab;
		personalAccessToken: string;
	}

	let {
		email_verified,
		usernameForm,
		passwordForm,
		deleteAccountForm,
		verifyEmailForm,
		sendEmailVerificationForm,
		changeEmailForm,
		displayPrefsForm,
		behaviorPrefsForm,
		userListSeriesSettingsForm,
		profilePictureForm,
		removeProfilePictureForm,
		homeDisplaySettingsForm,
		listLabelsForm,
		privacySettingsForm,
		view,
		personalAccessToken = $bindable(),
	}: Props = $props();
</script>

<div class="grid gap-4">
	<div class="grid overflow-x-auto whitespace-nowrap">
		<ul class="flex gap-2">
			<SidebarListItem
				active={view === 'account' || !view}
				href="{page.url.pathname}?view=account"
				text="Account"
				icon="profile"
			/>
			<SidebarListItem
				active={view === 'privacy'}
				href="{page.url.pathname}?view=privacy"
				text="Privacy"
				icon="lock"
			/>
			<SidebarListItem
				active={view === 'display'}
				href="{page.url.pathname}?view=display"
				text="Display"
				icon="books"
			/>
			<SidebarListItem
				active={view === 'list'}
				href="{page.url.pathname}?view=list"
				text="List"
				icon="series"
			/>
			<SidebarListItem
				active={view === 'behavior'}
				href="{page.url.pathname}?view=behavior"
				text="Behavior"
				icon="behavior"
			/>
			<SidebarListItem
				active={view === 'email'}
				href="{page.url.pathname}?view=email"
				text="Email settings"
				icon="email"
			/>
			<SidebarListItem
				active={view === 'picture'}
				href="{page.url.pathname}?view=picture"
				text="Profile picture"
				icon="imageFrame"
			/>
		</ul>
	</div>

	{#if view === 'account' || !view}
		<h2 class="text-2xl font-bold">Account preferences</h2>
		<div class="flex max-w-lg flex-col gap-4">
			<section>
				<UsernameForm {usernameForm} />
			</section>
			<Hr />
			<section>
				<PasswordForm {passwordForm} />
			</section>
			<Hr />
			<section>
				<!-- No superform used because we dont need to validate inputs -->
				<PersonalAccessTokenForm bind:token={personalAccessToken} />
			</section>
			<Hr />
			<section>
				<p class="error-text-color font-bold">Danger zone</p>
				<DeleteAccountForm {deleteAccountForm} />
			</section>
		</div>
	{:else if view === 'display'}
		<h2 class="text-2xl font-bold">Display preferences</h2>

		<div class="flex max-w-lg flex-col gap-4">
			<section>
				<h3 class="text-lg font-bold">Theme</h3>
				<ThemeSelect />
			</section>

			<Hr />

			<section>
				<DisplayPrefsForm {displayPrefsForm} />
			</section>

			<section>
				<HomeDisplayForm {homeDisplaySettingsForm} />
			</section>
		</div>
	{:else if view === 'list'}
		<h2 class="text-2xl font-bold">List settings</h2>
		<div class="flex max-w-lg flex-col gap-4">
			<section>
				<SeriesListSettingsForm {userListSeriesSettingsForm} />
			</section>

			<section>
				<ListLabelsForm {listLabelsForm} />
			</section>
		</div>
	{:else if view === 'email'}
		<h2 class="text-2xl font-bold">Email settings</h2>
		<div class="flex max-w-lg flex-col gap-4">
			<section>
				<VerifyEmailForm {verifyEmailForm} {sendEmailVerificationForm} {email_verified} />
			</section>

			<Hr />

			<section>
				<ChangeEmailForm {changeEmailForm} {email_verified} />
			</section>
		</div>
	{:else if view === 'picture'}
		<h2 class="text-2xl font-bold">Profile picture</h2>
		<div class="flex max-w-lg flex-col gap-4">
			<ProfilePictureForm {profilePictureForm} />
			<RemoveProfilePictureForm {removeProfilePictureForm} />
		</div>
	{:else if view === 'privacy'}
		<h2 class="text-2xl font-bold">Privacy settings</h2>
		<div class="flex max-w-lg flex-col gap-4">
			<section>
				<PrivacySettingsForm {privacySettingsForm} />
			</section>
		</div>
	{:else if view === 'behavior'}
		<h2 class="text-2xl font-bold">Behavior preferences</h2>
		<div class="flex max-w-xl flex-col gap-4">
			<section>
				<BehaviorPrefsForm {behaviorPrefsForm} />
			</section>
		</div>
	{/if}
</div>
