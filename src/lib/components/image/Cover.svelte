<script lang="ts">
	import { PUBLIC_IMAGE_URL } from '$env/static/public';
	import type { Nullish } from '$lib/server/zod/schema';

	interface Props {
		obj: {
			image: Nullish<{
				width: number;
				height: number;
				filename: string;
			}>;
		} | null;
		children?: import('svelte').Snippet;
	}

	let { obj, children }: Props = $props();
</script>

<div class="overflow-hidden rounded-md relative">
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
			class="bg-neutral-500 w-full h-full"
			style="aspect-ratio: 0.70381231671554252199413489736072;"
		>
			<p class="p-4">No cover</p>
		</div>
	{/if}
	{@render children?.()}
</div>
