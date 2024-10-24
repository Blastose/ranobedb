<script lang="ts">
	import Drawer from './drawer/Drawer.svelte';
	import type { User } from '$lib/server/lucia/lucia';

	export let user: User | null;

	export let hideTextWhenWidthSmall: boolean;
	export let showOpenDrawerButton: boolean = false;
</script>

<div class="flex items-center px-2">
	{#if showOpenDrawerButton}
		<Drawer {user} />
	{/if}
	<h2 class="text-2xl font-bold">
		<a aria-label="Home" class="logo-link" href="/">
			<img class="logo" height="48" width="48" src="/rndb_logo.png" alt="" />
			<span class:logo-text={hideTextWhenWidthSmall}>RanobeDB</span>
		</a>
	</h2>
</div>

<style>
	.logo {
		height: 24px;
		width: 24px;
	}

	.logo-link {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.logo-text {
		display: none;
	}

	@media (min-width: 640px) {
		.logo-text {
			display: block;
		}
	}
</style>
