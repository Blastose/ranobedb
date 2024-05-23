<script lang="ts">
	import SidebarListItem from '$lib/components/layout/sidebar/SidebarListItem.svelte';
	import { page } from '$app/stores';
	import UsernameForm from './UsernameForm.svelte';
	import type { passwordSchema, usernameSchema } from '$lib/zod/schema';
	import type { Infer, SuperValidated } from 'sveltekit-superforms';
	import PasswordForm from './PasswordForm.svelte';

	export let usernameForm: SuperValidated<Infer<typeof usernameSchema>>;
	export let passwordForm: SuperValidated<Infer<typeof passwordSchema>>;

	$: hash = $page.url.hash;
</script>

<div class="grid gap-4">
	<ul class="flex gap-2">
		<SidebarListItem
			active={hash === '#account' || !hash}
			href="{$page.url.pathname}#account"
			text="Account"
			icon="profile"
		/>
		<SidebarListItem
			active={hash === '#display'}
			href="{$page.url.pathname}#display"
			text="Display"
			icon="books"
		/>
	</ul>

	{#if hash === '#account' || !hash}
		<div class="flex flex-col gap-4">
			<section>
				<UsernameForm {usernameForm} />
			</section>
			<section>
				<PasswordForm {passwordForm} />
			</section>
		</div>
	{:else if hash === '#display'}
		<h2 class="font-bold text-lg">Display preferences</h2>
	{/if}
</div>
