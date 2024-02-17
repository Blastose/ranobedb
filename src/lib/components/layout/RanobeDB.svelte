<script lang="ts">
	import Drawer from './drawer/Drawer.svelte';
	import type { User } from 'lucia';

	export let user: User | null;

	export let hideTextWhenWidthSmall: boolean;
	export let showOpenDrawerButton: boolean = false;
</script>

<div class="flex items-center">
	{#if showOpenDrawerButton}
		<!-- Normally we would use a gap-4 on the above div, but -->
		<!-- The Drawer component uses Melt which uses a portal div that would -->
		<!-- also have a gap before it moves after hydration kicks in -->
		<div class="flex items-center mr-4">
			<Drawer {user} />
		</div>
	{/if}
	<h2 class="text-2xl font-bold">
		<a aria-label="Home" class="logo-link" href="/">
			<img class="logo" height="28" width="42" src="/rndb_logo.png" alt="" />
			<span class:logo-text={hideTextWhenWidthSmall}>RanobeDB</span>
		</a>
	</h2>
</div>

<style>
	.logo {
		height: 28px;
		width: 42px;
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
