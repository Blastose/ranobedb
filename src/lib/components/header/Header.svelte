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
	<div class="main-container header-content duration-150">
		<div class="flex items-center justify-center gap-2">
			{#if !$sidebar}
				<button
					class="hidden p-1 rounded-lg btn lg:block"
					aria-label="open sidebar"
					type="button"
					on:click={openSidebar}
				>
					<Icon height="24" width="24" name="menu" />
				</button>
			{/if}
			<button
				class="p-1 rounded-lg btn lg:hidden"
				aria-label="open sidebar"
				type="button"
				on:click={openSidebar}
			>
				<Icon height="24" width="24" name="menu" />
			</button>

			<a href="/" class="flex gap-2" aria-label="RanobeDB">
				<Logo height="36" width="36" name="logo" />
				<p class="title text-2xl font-bold">RanobeDB</p>
			</a>
		</div>
		<div class="flex items-center justify-center gap-4">
			<button
				aria-label={$theme === 'dark' ? 'switch theme to light' : 'switch theme to dark'}
				type="button"
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
		background-color: #fafafa9f;
		backdrop-filter: blur(12px);
	}

	.header-content {
		display: flex;
		justify-content: space-between;
		gap: 0.5rem;
		padding-top: 0.5rem;
		padding-bottom: 0.5rem;
	}

	:global(.dark) .header {
		background-color: #212224c2;
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
