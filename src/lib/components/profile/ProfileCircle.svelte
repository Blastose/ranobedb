<script lang="ts">
	import Icon from '$lib/components/icon/Icon.svelte';
	import ProfileMenu from '$lib/components/profile/ProfileMenu.svelte';
	import profileMenu from '$lib/stores/profileMenu';
	import type { User } from 'lucia';

	export let user: User | undefined;
	let toggleButton: Node | null = null;
</script>

<div class="relative">
	<button
		bind:this={toggleButton}
		aria-label="open profile menu"
		class="profile {user ? 'profile-logged-in' : ''}"
		type="button"
		on:click={() => {
			profileMenu.set(!$profileMenu);
		}}
	>
		{#if user}
			<span class="text-lg font-bold">{user.username[0]}</span>
		{:else}
			<Icon height="24" width="24" name="profile" />
		{/if}
	</button>
	{#if $profileMenu}
		<ProfileMenu {toggleButton} {user} />
	{/if}
</div>

<style>
	.profile {
		color: white;
		border-radius: 9999px;
		background-color: rgb(175, 172, 179);
		display: flex;
		align-items: center;
		justify-content: center;
		width: 3rem;
		height: 3rem;
	}

	.profile-logged-in {
		background-color: var(--primary-500);
	}
</style>
