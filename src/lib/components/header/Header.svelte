<script lang="ts">
	import sidebar from '$lib/stores/sidebar';
	import drawer from '$lib/stores/drawer';
	import focusSidebar from '$lib/stores/focusSidebar';
	import { theme, toggleTheme } from '$lib/stores/theme';
	import Icon from '$lib/components/icon/Icon.svelte';
	import Logo from '$lib/components/icon/Logo.svelte';
	import ProfileCircle from '$lib/components/profile/ProfileCircle.svelte';

	const openSidebar = () => {
		if (window.matchMedia('(min-width: 1024px)').matches) {
			sidebar.set(true);
		} else {
			drawer.set(true);
		}
		focusSidebar.set(true);
	};
</script>

<header class="header border-b border-[#4b4b4b15] dark:border-[#ffffff1a]">
	<div class="flex justify-between gap-2 px-8 py-2 mx-auto duration-150 container">
		<div class="flex items-center justify-center gap-2">
			{#if !$sidebar}
				<button
					class="hidden p-1 rounded-lg btn lg:block"
					aria-label="open sidebar"
					on:click={openSidebar}
				>
					<Icon height="24" width="24" name="menu" />
				</button>
			{/if}
			<button class="p-1 rounded-lg btn lg:hidden" aria-label="open sidebar" on:click={openSidebar}>
				<Icon height="24" width="24" name="menu" />
			</button>
			<Logo height="36" width="36" name="logo" />
			<p class="title text-2xl font-bold">RanobeDB</p>
		</div>
		<div class="flex items-center justify-center gap-4">
			<button
				aria-label={$theme === 'dark' ? 'switch theme to light' : 'switch theme to dark'}
				on:click={toggleTheme}
			>
				{#if $theme === 'dark'}
					<Icon height="24" width="24" name={'sun'} />
				{:else}
					<Icon height="24" width="24" name={'moon'} />
				{/if}
			</button>

			<ProfileCircle />
		</div>
	</div>
</header>

<style>
	.header {
		background-color: var(--primary-50);
	}

	:global(.dark) .header {
		background-color: var(--dark-700);
	}

	.title {
		display: none;
	}

	@media (min-width: 375px) {
		.title {
			display: block;
		}
	}
</style>
