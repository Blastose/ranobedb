<script lang="ts">
	import { PUBLIC_IMAGE_URL } from '$env/static/public';
	import { getDisplayPrefsContext } from '$lib/display/prefs';
	import type { Nullish } from '$lib/server/zod/schema';
	import NsfwOverlay from './NsfwOverlay.svelte';

	const DEFAULT_COVER_ASPECT_RATIO = '0.70381231671554252199413489736072';

	type Image = {
		width: number;
		height: number;
		filename: string;
		nsfw: boolean;
	};

	interface Props {
		image?: Nullish<Image>;
		blurTop?: boolean;
		revealable?: boolean;
		useDefaultCoverAspectRatio?: boolean;
		children?: import('svelte').Snippet;
	}

	const displayPrefs = getDisplayPrefsContext();
	let {
		image = undefined,
		blurTop = false,
		revealable = false,
		useDefaultCoverAspectRatio = false,
		children,
	}: Props = $props();

	let isNsfw = $derived(image?.nsfw === true && !$displayPrefs.show_nsfw);

	let aspectRatio = $derived.by(() => {
		if (useDefaultCoverAspectRatio) {
			return DEFAULT_COVER_ASPECT_RATIO;
		}
		if (!image) {
			return DEFAULT_COVER_ASPECT_RATIO;
		}
		return `${image.width}/${image.height}`;
	});
</script>

<div class="group relative overflow-hidden rounded-md" style={`aspect-ratio: ${aspectRatio};`}>
	{#if blurTop}
		<div
			class="absolute inset-x-0 top-0 h-1/5 bg-gradient-to-b
			{$displayPrefs.label_badge_display
				? 'from-[#303030]/20 dark:from-[#303030]/50'
				: 'from-[#303030]/5 dark:from-[#303030]/10'}
				     z-1 pointer-events-none to-transparent"
		></div>
	{/if}
	{#if image}
		{#key image.filename}
			<NsfwOverlay nsfw={isNsfw} {revealable} {aspectRatio}>
				<img
					width={image.width}
					height={image.height}
					src="{PUBLIC_IMAGE_URL}{image.filename}"
					alt=""
					class="h-full w-full object-cover"
					loading="lazy"
				/>
			</NsfwOverlay>
		{/key}
	{:else}
		<div
			class="h-full w-full bg-neutral-500 @container"
			style="aspect-ratio: {DEFAULT_COVER_ASPECT_RATIO};"
		>
			<p class="hidden p-4 @md:block">No cover</p>
		</div>
	{/if}
	{@render children?.()}
</div>
