<script lang="ts">
	import type { PageProps } from '../../../routes/$types';
	import BookImage from '$lib/components/book/BookImage.svelte';
	import BookCarousel from '$lib/components/book/BookCarousel.svelte';

	let { data }: { data: PageProps['data'] } = $props();
</script>

<BookCarousel>
	{#snippet link()}
		<h2 class="text-lg font-bold">Most popular series</h2>
	{/snippet}
	{#snippet items()}
		{#each data.mostPopularSeries.slice(0, 6) as series (series.id)}
			<div class="carousel-item-large">
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
