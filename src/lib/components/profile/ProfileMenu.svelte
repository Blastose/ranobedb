<script lang="ts">
	import ProfileMenuItem from '$lib/components/profile/ProfileMenuItem.svelte';
	import { clickOutside } from '$lib/util/clickOutside';
	import profileMenu from '$lib/stores/profileMenu';
	import { fly } from 'svelte/transition';

	export let toggleButton: Node | null = null;
</script>

<nav
	class="menu"
	use:clickOutside={toggleButton}
	on:outclick={() => {
		profileMenu.set(false);
	}}
	transition:fly={{ y: -10, duration: 100 }}
>
	<ul>
		{#if true}
			<li class="py-2 text-center">
				<a href="profile">
					<p class="text-lg font-bold">Blastose</p>
				</a>
			</li>
			<ProfileMenuItem text={'Profile'} href={'profile'} />
			<ProfileMenuItem text={'My List'} href={'my-list'} />
			<ProfileMenuItem text={'Dummy'} href={'dummy'} />
			<ProfileMenuItem text={'Sign out'} href={'signout'} />
		{:else}
			<ProfileMenuItem text={'Log in'} href={'login'} />
			<ProfileMenuItem text={'Sign up'} href={'signup'} />
		{/if}
	</ul>
</nav>

<style>
	.menu {
		position: absolute;
		left: auto;
		right: 0;
		min-width: 15rem;
		border-radius: 0.375rem;
		padding: 0.5rem;
		margin-top: 0.2rem;
		background-color: var(--primary-100);
	}

	:global(.dark) .menu {
		background-color: var(--dark-300);
	}
</style>
