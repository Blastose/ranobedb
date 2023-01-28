<script lang="ts">
	import BookView from '$lib/components/book/BookView.svelte';
	import Box from '$lib/components/box/Box.svelte';
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import TopBottomLayout from '$lib/components/layout/TopBottomLayout.svelte';

	export let data: PageData;
	let bookCover = data.books[0]?.cover_image_file_name;
</script>

<svelte:head>
	<title>{data.release.name} - RanobeDB</title>
</svelte:head>

<TopBottomLayout backgroundCover={bookCover}>
	<svelte:fragment slot="top">
		<p class="text-xl sm:text-3xl font-bold">{data.release.name}</p>
		<p class="text-lg sm:text-xl font-semibold">{data.release.name_romaji ?? ''}</p>
		<p class="text-sm sm:text-base font-semibold">Release</p>
	</svelte:fragment>

	<svelte:fragment slot="content">
		<div class="flex flex-col gap-1">
			<p>Description: {data.release.description ?? 'None'}</p>
			<p>Language: {data.release.lang}</p>
			<p>ISBN13: {data.release.isbn13 ?? 'None'}</p>
			<p>Release Date: {data.release.release_date}</p>
			<p>Format: {data.release.format}</p>
			<div>
				<p>Publishers:</p>
				{#each data.release.publishers as publisher}
					<div>
						<a class="link" href="/publisher/{publisher.id}">{publisher.name}</a>
					</div>
				{/each}
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

		<div>
			<p class="font-bold">Books that this release belongs to</p>
			<BookView books={data.books} />
		</div>
	</svelte:fragment>
</TopBottomLayout>
