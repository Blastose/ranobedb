<script lang="ts">
	import type { PageData } from './$types';
	import BookCardSimpleContainer from '$lib/components/book/book-card/BookCardSimpleContainer.svelte';
	import BookBannerCarousel from '$lib/components/book/book-banner/BookBannerCarousel.svelte';
	import BookImageSwiper from '$lib/components/book/book-image/BookImageSwiper.svelte';

	export let data: PageData;
</script>

<svelte:head>
	<title>RanobeDB</title>
</svelte:head>

<main class="main-container">
	<div class="flex flex-col gap-4">
		<BookBannerCarousel title={'Featured'} books={data.allBooks.slice(0, 10)} />

		<div class="flex flex-col gap-2">
			<p class="text-2xl font-bold">Recently Added</p>
			<BookCardSimpleContainer books={data.recentlyAddedBooks} />
		</div>

		<div class="flex flex-col gap-2">
			<p class="text-2xl font-bold">Recently Released</p>
			<BookImageSwiper books={data.recentlyReleasedBooks} />
		</div>
	</div>
</main>
