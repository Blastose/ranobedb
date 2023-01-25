<script lang="ts">
	import BookView from '$lib/components/book/BookView.svelte';
	import Box from '$lib/components/box/Box.svelte';
	import { page } from '$app/stores';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<svelte:head>
	<title>{data.publisher.name} - RanobeDB</title>
</svelte:head>

<main class="main-container">
	<div class="flex flex-col gap-4">
		<div>
			<p class="font-bold text-2xl">{data.publisher.name}</p>
			{#if data.publisher.name_romaji}
				<p>{data.publisher.name_romaji}</p>
			{/if}
		</div>
		<div class="w-min">
			<Box
				text={'Edit'}
				href={`/publisher/${$page.params.id}/edit`}
				icon={'pencil'}
				preload={false}
			/>
		</div>
		<div>
			<p class="font-bold">Biography</p>
			<div class="markdown-text">
				{@html data.publisher.description || 'N/A'}
			</div>
		</div>

		<div>
			{#each Object.entries(data.publisherChildrenGrouped) as [key, publisherChildren]}
				{key}:
				{#each publisherChildren as publisherChild}
					<div class="markdown-text">
						<a href="/publisher/{publisherChild.id}">{publisherChild.id}: {publisherChild.name}</a>
					</div>
				{/each}
			{/each}
			{#if data.publisher.publisher_parents.length > 0}
				Parent:
				{#each data.publisher.publisher_parents as publisherParent}
					<div class="markdown-text">
						<a href="/publisher/{publisherParent.id}">
							{publisherParent.id}: {publisherParent.name}
						</a>
					</div>
				{/each}
			{/if}
		</div>
		<BookView books={data.books} />
	</div>
</main>
