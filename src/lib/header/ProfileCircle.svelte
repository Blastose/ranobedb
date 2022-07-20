<script lang="ts">
	import ProfileMenu from './ProfileMenu.svelte';
	import { profileMenuOpen } from '$lib/stores/profileMenuStore';
	import { session } from '$app/stores';
	import Icon from '$lib/components/Icon.svelte';

	let profileButton: HTMLElement;
</script>

<div class="relative">
	<button
		bind:this={profileButton}
		on:click={() => {
			$profileMenuOpen = !$profileMenuOpen;
		}}
		class="rounded-full flex items-center justify-center {$session.user
			? 'bg-[#73739C] w-12 h-12'
			: 'p-3 bg-gray-300'} text-white"
	>
		{#if $session.user}
			<span class="text-lg font-bold">
				{$session.user.user_metadata.username.charAt(0).toUpperCase()}
			</span>
		{:else}
			<Icon name="profile" width="24" height="24" />
		{/if}
	</button>
	{#if $profileMenuOpen}
		<ProfileMenu toggleButton={profileButton} />
	{/if}
</div>
