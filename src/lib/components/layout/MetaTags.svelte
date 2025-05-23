<script lang="ts">
	import type { Nullish } from '$lib/server/zod/schema';
	import { page } from '$app/stores';

	interface Props {
		title: string;
		type?: string;
		image?: Nullish<string>;
		url?: string | undefined;
		description: string;
		site_name: string;
	}

	let {
		title,
		type = 'object',
		image = undefined,
		url = undefined,
		description,
		site_name,
	}: Props = $props();
</script>

<svelte:head>
	<meta property="og:title" content={title} />
	<meta property="og:type" content={type} />
	{#if image}
		<meta property="og:image" content={image} />
	{/if}
	<meta property="og:url" content={url || $page.url.toString()} />
	<meta property="og:description" content={description} />
	<meta name="description" content={description} />
	<meta property="og:site_name" content={site_name} />
</svelte:head>
