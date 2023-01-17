<script lang="ts">
	import type { PageData } from './$types';
	import BookLabelTabs from '$lib/components/book/BookLabelTabs.svelte';
	import BookView from '$lib/components/book/BookView.svelte';
	import Pagination from '$lib/components/pagination/Pagination.svelte';

	export let data: PageData;
</script>

<svelte:head>
	<title>My List - RanobeDB</title>
</svelte:head>

<main class="mx-auto main-container flex flex-col gap-4">
	<p class="font-bold text-2xl">My List</p>
	<BookLabelTabs />
	<div class="flex flex-col gap-2">
		<div class="flex flex-col gap-4">
			<BookView books={data.reads} extended={true} numberOfBooks={data.count} />
			<Pagination totalPages={data.totalPages} />
		</div>
	</div>
</main>
