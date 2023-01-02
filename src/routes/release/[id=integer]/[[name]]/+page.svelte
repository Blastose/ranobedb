<script lang="ts">
	import { convertDate } from '$lib/util/convertDate';
	import BookView from '$lib/components/book/BookView.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<svelte:head>
	<title>{data.release.name}:release - RanobeDB</title>
</svelte:head>

<main class="main-container">
	<div class="flex flex-col gap-4">
		<div class="flex flex-col gap-2">
			<div>
				<p class="font-bold text-2xl">
					{data.release.name}
				</p>
				<p>{data.release.name_romaji}</p>
			</div>
			<div>
				<p>Description: {data.release.description ?? 'N/A'}</p>
				<p>Language: {data.release.lang}</p>
				<p>ISBN13: {data.release.isbn13 ?? 'N/A'}</p>
				<p>Release Date: {convertDate(data.release.release_date)}</p>
				<p>Format: {data.release.format}</p>
				<p>
					Publishers:
					{#each data.release.publishers as publisher}
						<span class="mx-2"><a href="/publisher/{publisher.id}">{publisher.name}</a></span>
					{/each}
				</p>
			</div>
		</div>
		<div class="flex flex-col gap-2">
			<p class="font-bold text-xl">Books that this release belong to</p>
			<BookView books={data.books} />
		</div>
	</div>
</main>

<style>
</style>
