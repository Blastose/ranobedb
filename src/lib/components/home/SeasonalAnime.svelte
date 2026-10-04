<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PageProps } from '../../../routes/$types';
	import BookImage from '$lib/components/book/BookImage.svelte';
	import BookCarousel from '$lib/components/book/BookCarousel.svelte';

	let { data }: { data: PageProps['data'] } = $props();
</script>

<BookCarousel viewAllLink={resolve('/seasonal-anime')}>
	{#snippet link()}
		<h2 class="text-lg font-bold">{data.seasonalAnimeSeason} Anime</h2>
	{/snippet}
	{#snippet items()}
		{#each data.seasonalAnime as series (series.id)}
			<div class="carousel-item">
				<BookImage
					book={{
						title: series.title,
						romaji: series.romaji,
						id: series.id,
						image: series.book?.image,
						lang: series.lang,
						romaji_orig: series.romaji_orig,
						title_orig: series.title_orig,
					}}
					urlPrefix="/series/"
				></BookImage>
			</div>
		{/each}
	{/snippet}
</BookCarousel>
