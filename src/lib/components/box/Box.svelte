<script lang="ts">
	import BoxContent from '$lib/components/box/BoxContent.svelte';
	import type { IconType } from '$lib/components/icon/Icon.svelte';

	export let text: string;
	export let icon: IconType | null;
	export let href: string | null;
	export let size: 'small' | 'normal' = 'normal';
</script>

<div class="box-container">
	{#if href}
		<a {href}>
			<BoxContent {icon} {size} {text} />
		</a>
	{:else}
		<BoxContent {icon} {size} {text} />
	{/if}
</div>

<style>
	.box-container {
		transition-duration: 75ms;
		background-color: var(--primary-200);
		border-radius: 0.125rem;
	}

	.box-container:hover {
		background-color: var(--primary-400);
	}

	:global(.dark) .box-container {
		background-color: var(--dark-200);
	}

	:global(.dark) .box-container:hover {
		background-color: var(--dark-400);
	}
</style>
