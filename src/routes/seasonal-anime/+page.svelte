<script lang="ts">
	import BookImage from '$lib/components/book/BookImage.svelte';
	import BookImageBadge from '$lib/components/book/BookImageBadge.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import BookImageContainer from '$lib/components/layout/container/BookImageContainer.svelte';
	import LinkBox from '$lib/components/layout/db/LinkBox.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<PageTitle title="{data.seasonalAnimeSeason} Anime" />

<main class="container-rndb flex flex-col gap-4">
	<h1 class="text-4xl font-bold">{data.seasonalAnimeSeason} Anime</h1>
	<p>{data.series.length} results</p>
	{#if data.series.length > 0}
		<BookImageContainer moreColumns={true}>
			{#each data.series as series (series.id)}
				{#if series.book}
					<BookImage
						book={{
							title: series.title,
							romaji: series.romaji,
							id: series.id,
							image: series.book.image,
							lang: series.lang,
							romaji_orig: series.romaji_orig,
							title_orig: series.title_orig,
						}}
						urlPrefix="/series/"
						blurTop={Boolean(series.label?.label)}
					>
						{#if series.label}
							<BookImageBadge badges={[series.label.label]} location="top-right" />
						{/if}
						{#if series.volumes}
							<BookImageBadge badges={[`${series.volumes.count} vols.`]} location="bottom-right" />
						{/if}
					</BookImage>
				{:else}
					<LinkBox display={series.title ?? ''} href="/series/{series.id}" />
				{/if}
			{/each}
		</BookImageContainer>
	{:else}
		<p class="sub-text text-center">There are no results</p>
	{/if}
</main>
