<script lang="ts">
	import SidebarListItem from '$lib/components/layout/sidebar/SidebarListItem.svelte';
	import { page } from '$app/stores';
	import UsernameForm from './UsernameForm.svelte';
	import type {
		changeEmailSchema,
		displayPrefsSchema,
		passwordSchema,
		sendEmailVerificationSchema,
		usernameSchema,
		verifyEmailSchema,
	} from '$lib/server/zod/schema';
	import type { Infer, SuperValidated } from 'sveltekit-superforms';
	import PasswordForm from './PasswordForm.svelte';
	import DisplayPrefsForm from './DisplayPrefsForm.svelte';
	import ThemeSelect from './ThemeSelect.svelte';
	import Hr from '$lib/components/layout/Hr.svelte';
	import ChangeEmailForm from './email/ChangeEmailForm.svelte';
	import VerifyEmailForm from './email/VerifyEmailForm.svelte';
	import type { SettingsTab } from '$lib/db/dbConsts';

	export let email_verified: boolean;
	export let usernameForm: SuperValidated<Infer<typeof usernameSchema>>;
	export let passwordForm: SuperValidated<Infer<typeof passwordSchema>>;
	export let verifyEmailForm: SuperValidated<Infer<typeof verifyEmailSchema>>;
	export let sendEmailVerificationForm: SuperValidated<Infer<typeof sendEmailVerificationSchema>>;
	export let changeEmailForm: SuperValidated<Infer<typeof changeEmailSchema>>;
	export let displayPrefsForm: SuperValidated<Infer<typeof displayPrefsSchema>>;
	export let view: SettingsTab;
</script>

<div class="grid gap-4">
	<div class="grid overflow-x-auto whitespace-nowrap">
		<ul class="flex gap-2">
			<SidebarListItem
				active={view === 'account' || !view}
				href="{$page.url.pathname}?view=account"
				text="Account"
				icon="profile"
			/>
			<SidebarListItem
				active={view === 'display'}
				href="{$page.url.pathname}?view=display"
				text="Display"
				icon="books"
			/>
			<SidebarListItem
				active={view === 'email'}
				href="{$page.url.pathname}?view=email"
				text="Email settings"
				icon="email"
			/>
		</ul>
	</div>

	{#if view === 'account' || !view}
		<h2 class="font-bold text-2xl">Account preferences</h2>
		<div class="flex flex-col gap-4 max-w-lg">
			<section>
				<UsernameForm {usernameForm} />
			</section>
			<Hr />
			<section>
				<PasswordForm {passwordForm} />
			</section>
		</div>
	{:else if view === 'display'}
		<h2 class="font-bold text-2xl">Display preferences</h2>

		<div class="flex flex-col gap-4 max-w-lg">
			<section>
				<h3 class="text-lg font-bold">Theme</h3>
				<ThemeSelect />
			</section>

			<Hr />

			<section>
				<DisplayPrefsForm {displayPrefsForm} />
			</section>
		</div>
	{:else if view === 'email'}
		{#if false}
			<p>
				You cannot verify or change your email at this time. This feature will be added in the
				future.
			</p>
		{:else}
			<h2 class="font-bold text-2xl">Email settings</h2>
			<div class="flex flex-col gap-4 max-w-lg">
				<section>
					<VerifyEmailForm {verifyEmailForm} {sendEmailVerificationForm} {email_verified} />
				</section>

				<Hr />

				<section>
					<ChangeEmailForm {changeEmailForm} {email_verified} />
				</section>
			</div>
		{/if}
	{/if}
</div>
