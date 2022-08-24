<script lang="ts">
	import type BookInfo from '$lib/models/bookInfo';
	import BookCardContainer from '$lib/book/BookCardContainer.svelte';

	export let thisMonthBooks: BookInfo[];
	export let recentBooks: BookInfo[];
</script>

<svelte:head><title>Light Novel DB</title></svelte:head>

<main class="container mx-auto px-8 pt-4 pb-8 duration-150">
	<div class="flex flex-col gap-4">
		<h1 class="text-2xl font-semibold dark:text-white">Welcome to Light Novel DB</h1>

		<div class="flex flex-col gap-6">
			<div class="flex flex-col gap-2">
				<span class="text-lg font-semibold dark:text-white">This Month</span>
				<BookCardContainer books={thisMonthBooks} />
			</div>

			<div class="flex flex-col gap-2">
				<span class="text-lg font-semibold dark:text-white">Recently added</span>
				<BookCardContainer books={recentBooks} />
			</div>
		</div>
	</div>
</main>
