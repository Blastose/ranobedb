<script lang="ts">
	import ProfileIcon from '$lib/svg/ProfileIcon.svelte';
	import ProfileMenu from './ProfileMenu.svelte';
	import { reader } from '$lib/stores/readerStore';
	import { profileMenuOpen } from '$lib/stores/profileMenuStore';

	let profileButton;
</script>

<div class="relative">
	<button
		bind:this={profileButton}
		on:click={() => {
			$profileMenuOpen = !$profileMenuOpen;
		}}
		class="rounded-full flex items-center justify-center {$reader
			? 'bg-[#73739C] w-12 h-12'
			: 'p-3 bg-gray-300'} text-white"
	>
		{#if $reader}
			<span class="text-lg font-bold">{$reader.reader_name.charAt(0)}</span>
		{:else}
			<ProfileIcon />
		{/if}
	</button>
	{#if $profileMenuOpen}
		<ProfileMenu toggleButton={profileButton} />
	{/if}
</div>
