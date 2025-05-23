<script lang="ts">
	import type { User } from '$lib/server/lucia/lucia';
	import ProfileButton from '$lib/components/layout/profile/ProfileButton.svelte';
	import RanobeDb from '../RanobeDB.svelte';
	import { page } from '$app/state';
	import { getSidebarStoreContext } from '$lib/stores/sidebarStore';
	import SearchExpand from '$lib/components/layout/header/SearchExpand.svelte';
	import Notification from './Notification.svelte';

	interface Props {
		user: User | null;
	}

	let { user }: Props = $props();

	function disableHeaderOpacity(pathname: string) {
		if (
			pathname.startsWith('/book/') ||
			pathname.startsWith('/series/') ||
			pathname.startsWith('/release/') ||
			pathname.startsWith('/staff/') ||
			pathname.startsWith('/publisher/') ||
			pathname.startsWith('/user/') ||
			pathname.startsWith('/review/')
		) {
			return true;
		}
		return false;
	}

	let scrollY: number | undefined = $state();
	let isOnBookRoute = $derived(disableHeaderOpacity(page.url.pathname));

	const sidebarStore = getSidebarStoreContext();
</script>

<svelte:window bind:scrollY />

<header
	class="header"
	class:on-book-route={isOnBookRoute}
	class:scrolled={scrollY && scrollY > 0}
	class:hide-bg-color={isOnBookRoute}
>
	<div class="header-items container-rndb">
		<div class="ranobedb-logo" class:sidebar-open={$sidebarStore === 'open'}>
			<RanobeDb {user} hideTextWhenWidthSmall={true} showOpenDrawerButton={true} />
		</div>

		<div class="flex gap-4">
			<SearchExpand />
			{#if user}
				<Notification />
			{/if}
			<ProfileButton {user} />
		</div>
	</div>
</header>

<style>
	.header {
		height: var(--header-height);
		position: sticky;
		top: 0;
		view-transition-name: header;
		background-color: var(--bg-light);
		z-index: 9999;
	}

	.ranobedb-logo {
		visibility: visible;
	}

	@media (min-width: 1024px) {
		.ranobedb-logo.sidebar-open {
			visibility: hidden;
		}
	}

	.on-book-route {
		transition: background-color 300ms;
		transition-timing-function: cubic-bezier(0.4, 0, 1, 1);
	}

	:global(.dark) .header {
		background-color: var(--bg-dark);
	}

	.header.hide-bg-color:not(.scrolled) {
		background-color: unset;
	}

	.header-items {
		height: 100%;
		padding-bottom: 0;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
</style>
