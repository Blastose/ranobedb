<script lang="ts">
	import BookView from '$lib/components/book/BookView.svelte';
	import Box from '$lib/components/box/Box.svelte';
	import TopBottomLayout from '$lib/components/layout/TopBottomLayout.svelte';
	import { page } from '$app/stores';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<svelte:head>
	<title>{data.publisher.name} - RanobeDB</title>
</svelte:head>

<TopBottomLayout backgroundCover={null}>
	<svelte:fragment slot="top">
		<p class="text-xl sm:text-3xl font-bold">{data.publisher.name}</p>
		<p class="text-lg sm:text-xl font-semibold">{data.publisher.name_romaji ?? ''}</p>
		<p class="text-sm sm:text-base font-semibold">Publisher</p>
	</svelte:fragment>

	<svelte:fragment slot="content">
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

		<BookView books={data.publisher.books} />
	</svelte:fragment>
</TopBottomLayout>
