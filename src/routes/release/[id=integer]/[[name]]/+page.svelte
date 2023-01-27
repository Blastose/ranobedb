<script lang="ts">
	import BookView from '$lib/components/book/BookView.svelte';
	import Box from '$lib/components/box/Box.svelte';
	import { page } from '$app/stores';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<svelte:head>
	<title>{data.release.name} - RanobeDB</title>
</svelte:head>

<main class="main-container">
	<div class="flex flex-col gap-4">
		<div class="flex flex-col gap-2">
			<div>
				<p class="text-xl sm:text-3xl font-bold">{data.release.name}</p>
				<p class="text-lg sm:text-xl font-semibold">{data.release.name_romaji ?? ''}</p>
				<p class="text-sm sm:text-base font-semibold">Release</p>
			</div>
			<div>
				<p>Description: {data.release.description ?? 'None'}</p>
				<p>Language: {data.release.lang}</p>
				<p>ISBN13: {data.release.isbn13 ?? 'None'}</p>
				<p>Release Date: {data.release.release_date}</p>
				<p>Format: {data.release.format}</p>
				<p>
					Publishers:
					{#each data.release.publishers as publisher}
						<span class="mx-2"
							><a class="link" href="/publisher/{publisher.id}">{publisher.name}</a></span
						>
					{/each}
				</p>
			</div>
		</div>
		<div class="w-min">
			<Box
				text={'Edit'}
				href={`/release/${$page.params.id}/edit`}
				icon={'pencil'}
				preload={false}
			/>
		</div>
		<div class="flex flex-col gap-2">
			<p class="font-bold text-xl">Books that this release belong to</p>
			<BookView books={data.books} />
		</div>
	</div>
</main>

<style>
</style>
