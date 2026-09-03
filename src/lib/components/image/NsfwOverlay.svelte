<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		nsfw: boolean;
		revealable?: boolean;
		label?: string;
		aspectRatio: string;
		children: Snippet;
	}

	// Aspect ratio is also needed in this overlay component to hide the blur effect on the rounded corners for some reason
	let { nsfw, revealable = false, label = 'NSFW', aspectRatio, children }: Props = $props();

	let revealed = $state(false);
	let showBlur = $derived(nsfw && !revealed);
	let showRehide = $derived(revealable && nsfw && revealed);
</script>

{#if nsfw}
	<div
		class="group relative overflow-hidden"
		class:nsfw-active={showBlur}
		style={`aspect-ratio: ${aspectRatio};`}
	>
		{@render children?.()}
		{#if showBlur}
			{#if revealable}
				<button
					type="button"
					class="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-md bg-black/30 text-white"
					onclick={() => (revealed = true)}
				>
					<span class="text-lg font-bold">{label}</span>
					<span class="text-xs">Click to reveal</span>
				</button>
			{:else}
				<div class="absolute inset-0 flex items-center justify-center rounded-md bg-black/30">
					<span class="text-sm font-bold text-white">{label}</span>
				</div>
			{/if}
		{/if}
		{#if showRehide}
			<button
				type="button"
				class="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-black/50 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
				onclick={() => (revealed = false)}
			>
				Blur
			</button>
		{/if}
	</div>
{:else}
	{@render children?.()}
{/if}

<style>
	:global(.nsfw-active > img) {
		filter: blur(24px);
	}
</style>
