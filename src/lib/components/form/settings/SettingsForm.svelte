<script lang="ts">
	import SidebarListItem from '$lib/components/layout/sidebar/SidebarListItem.svelte';
	import { page } from '$app/stores';
	import UsernameForm from './UsernameForm.svelte';
	import type { displayPrefsSchema, passwordSchema, usernameSchema } from '$lib/server/zod/schema';
	import type { Infer, SuperValidated } from 'sveltekit-superforms';
	import PasswordForm from './PasswordForm.svelte';
	import DisplayPrefsForm from './DisplayPrefsForm.svelte';
	import ThemeSelect from './ThemeSelect.svelte';
	import Hr from '$lib/components/layout/Hr.svelte';

	export let usernameForm: SuperValidated<Infer<typeof usernameSchema>>;
	export let passwordForm: SuperValidated<Infer<typeof passwordSchema>>;
	export let displayPrefsForm: SuperValidated<Infer<typeof displayPrefsSchema>>;
	export let view: string;
</script>

<div class="grid gap-4">
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
	</ul>

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
	{/if}
</div>
