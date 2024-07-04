<script lang="ts">
	import type { Nullish } from '$lib/server/zod/schema';

	export let title: string;
	export let type: string = 'object';
	export let image: Nullish<string>;
	export let url: string;
	export let description: string;
	export let site_name: string;
</script>

<svelte:head>
	<meta property="og:title" content={title} />
	<meta property="og:type" content={type} />
	{#if image}
		<meta property="og:image" content={image} />
	{/if}
	<meta property="og:url" content={url} />
	<meta property="og:description" content={description} />
	<meta name="description" content={description} />
	<meta property="og:site_name" content={site_name} />
</svelte:head>
