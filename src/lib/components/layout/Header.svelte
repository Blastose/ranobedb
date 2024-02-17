<script lang="ts">
	import type { User } from 'lucia';
	import ProfileButton from '$lib/components/layout/profile/ProfileButton.svelte';
	import RanobeDb from './RanobeDB.svelte';
	import { page } from '$app/stores';
	import SearchInput from '$lib/components/form/SearchInput.svelte';

	export let user: User | null;

	function disableHeaderOpacity(pathname: string) {
		if (
			pathname.startsWith('/book/') ||
			pathname.startsWith('/series/') ||
			pathname.startsWith('/release/') ||
			pathname.startsWith('/staff/') ||
			pathname.startsWith('/publisher/')
		) {
			return true;
		}
		return false;
	}

	let scrollY: number | undefined;
	$: isOnBookRoute = disableHeaderOpacity($page.url.pathname);
</script>

<svelte:window bind:scrollY />

<header
	class="header"
	class:on-book-route={isOnBookRoute}
	class:scrolled={scrollY && scrollY > 0}
	class:hide-bg-color={isOnBookRoute}
>
	<div class="header-items container-rndb">
		<div class="visible lg:invisible">
			<RanobeDb {user} hideTextWhenWidthSmall={true} showOpenDrawerButton={true} />
		</div>

		<div class="flex gap-4">
			<SearchInput ariaLabel="Quick search" inputPlaceholder="Search" />

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

	.on-book-route {
		transition: background-color 450ms;
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
