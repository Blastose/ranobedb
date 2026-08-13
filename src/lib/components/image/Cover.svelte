<script lang="ts">
	import { PUBLIC_IMAGE_URL } from '$env/static/public';
	import { getDisplayPrefsContext } from '$lib/display/prefs';
	import type { Nullish } from '$lib/server/zod/schema';

	interface Props {
		obj: {
			image: Nullish<{
				width: number;
				height: number;
				filename: string;
			}>;
		} | null;
		blurTop?: boolean;
		children?: import('svelte').Snippet;
	}

	const displayPrefs = getDisplayPrefsContext();
	let { obj, blurTop = false, children }: Props = $props();
</script>

<div class="relative overflow-hidden rounded-md">
	{#if blurTop}
		<div
			class="absolute inset-x-0 top-0 h-1/5 bg-gradient-to-b
			{$displayPrefs.label_badge_display
				? 'from-[#303030]/20 dark:from-[#303030]/50'
				: 'from-[#303030]/5 dark:from-[#303030]/10'}
				     z-1 pointer-events-none to-transparent"
		></div>
	{/if}
	{#if obj?.image}
		{#key obj.image.filename}
			<img
				width={obj?.image?.width}
				height={obj?.image?.height}
				src="{PUBLIC_IMAGE_URL}{obj?.image?.filename}"
				alt=""
				class="w-full rounded-md object-cover"
				style="aspect-ratio: 0.70381231671554252199413489736072;"
				loading="lazy"
			/>
		{/key}
	{:else}
		<div
			class="h-full w-full bg-neutral-500 @container"
			style="aspect-ratio: 0.70381231671554252199413489736072;"
		>
			<p class="hidden p-4 @md:block">No cover</p>
		</div>
	{/if}
	{@render children?.()}
</div>
