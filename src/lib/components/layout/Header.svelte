<script lang="ts">
	import type { User } from 'lucia';
	import ProfileButton from '$lib/components/layout/profile/ProfileButton.svelte';
	import RanobeDb from './RanobeDB.svelte';
	import Search from './Search.svelte';

	export let user: User | undefined;
	user;
</script>

<header class="header">
	<div class="header-items container-rndb">
		<div class="visible lg:invisible">
			<RanobeDb hideTextWhenWidthSmall={true} />
		</div>

		<div class="flex gap-4">
			<Search />
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
		z-index: 1;
	}

	:global(.dark) .header {
		background-color: var(--bg-dark);
	}

	.header-items {
		height: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
</style>
