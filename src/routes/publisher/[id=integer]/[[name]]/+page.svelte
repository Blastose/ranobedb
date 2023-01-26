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

<main class="publisher-container">
	<div class="highlight">
		<div class="main-container">
			<p class="text-xl sm:text-3xl font-bold">{data.publisher.name}</p>
			<p class="text-lg sm:text-xl font-semibold">{data.publisher.name_romaji ?? ''}</p>
		</div>
	</div>

	<div class="main-container content">
		<div>
			<p class="font-bold">About</p>
			<div class="markdown-text">
				{@html data.publisher.description || 'N/A'}
			</div>
		</div>

		<div>
			<p class="font-bold">Publisher Relations</p>
			<div class="publisher-rel-container">
				{#each Object.entries(data.publisherChildrenGrouped) as [key, publisherChildren]}
					<div>
						<p class="capitalize">{key}:</p>
						{#each publisherChildren as publisherChild}
							<div>
								<a class="link" href="/publisher/{publisherChild.id}">
									{publisherChild.name}
								</a>
							</div>
						{/each}
					</div>
				{/each}
				{#if data.publisher.publisher_parents.length > 0}
					<div>
						<p>Parent publisher:</p>
						{#each data.publisher.publisher_parents as publisherParent}
							<div>
								<a class="link" href="/publisher/{publisherParent.id}">
									{publisherParent.name}
								</a>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>

		<div class="w-min">
			<Box
				text={'Edit'}
				href={`/publisher/${$page.params.id}/edit`}
				icon={'pencil'}
				preload={false}
			/>
		</div>

		<BookView books={data.books} />
	</div>
</main>

<style>
	.publisher-container {
		display: grid;
		grid-template-areas:
			'highlight'
			'content';
		grid-template-rows: 10rem 1fr;
	}

	.highlight {
		background: linear-gradient(var(--primary-500), #2b2c3d);
		display: flex;
		align-items: flex-end;
		color: white;
	}

	.content {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.publisher-rel-container {
		display: grid;
		grid-template-columns: 1fr;
		row-gap: 1rem;
		column-gap: 0.5rem;
	}

	@media (min-width: 640px) {
		.publisher-rel-container {
			grid-auto-flow: column;
			grid-template-columns: 1fr 1fr;
		}
	}
</style>
