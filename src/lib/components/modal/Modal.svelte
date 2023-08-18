<script lang="ts">
	import { melt } from '@melt-ui/svelte';
	import type { Dialog } from '@melt-ui/svelte';
	import type { Writable } from 'svelte/store';
	import { fade, fly } from 'svelte/transition';

	export let portalled: Dialog['elements']['portalled'];
	export let overlay: Dialog['elements']['overlay'];
	export let content: Dialog['elements']['content'];
	export let open: Writable<boolean>;
</script>

<div use:melt={$portalled}>
	{#if $open}
		<div transition:fade={{ duration: 150 }} use:melt={$overlay} class="overlay" />
		<div class="content" transition:fly={{ y: -10, duration: 150 }} use:melt={$content}>
			<slot />
		</div>
	{/if}
</div>

<style>
	.overlay {
		position: fixed;
		inset: 0px;
		z-index: 50;
		background-color: rgba(0, 0, 0, 0.5);
	}

	.content {
		position: fixed;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		z-index: 50;
		border-radius: 0.375rem;
		background-color: white;
		padding: 1.5rem;
		width: 90vw;
		max-width: 640px;
		height: 100%;
		max-height: 540px;
		overflow-y: auto;
		overflow-x: hidden;
	}

	:global(.dark) .content {
		background-color: var(--dark-700);
	}

	@media (min-width: 640px) {
		.content {
			max-height: 480px;
		}
	}
</style>
