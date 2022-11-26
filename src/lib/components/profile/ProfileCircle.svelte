<script lang="ts">
	import Icon from '$lib/components/icon/Icon.svelte';
	import ProfileMenu from '$lib/components/profile/ProfileMenu.svelte';
	import profileMenu from '$lib/stores/profileMenu';

	let toggleButton: Node | null = null;
</script>

<div class="relative">
	<button
		bind:this={toggleButton}
		aria-label="open profile menu"
		class="profile {true ? 'profile-logged-in' : ''}"
		on:click={() => {
			profileMenu.set(!$profileMenu);
		}}
	>
		{#if true}
			<span class="text-lg font-bold">B</span>
		{:else}
			<Icon height="24" width="24" name="profile" />
		{/if}
	</button>
	{#if $profileMenu}
		<ProfileMenu {toggleButton} />
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
	}

	.profile-logged-in {
		background-color: var(--primary-500);
		width: 3rem;
		height: 3rem;
	}
</style>
