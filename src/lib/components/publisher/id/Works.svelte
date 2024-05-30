<script lang="ts">
	import BookImage from '$lib/components/book/BookImage.svelte';
	import BookImageBadge from '$lib/components/book/BookImageBadge.svelte';
	import BookImageContainer from '$lib/components/layout/container/BookImageContainer.svelte';
	import PaginationContainer from '$lib/components/pagination/PaginationContainer.svelte';
	import Tabs from '$lib/components/tabs/Tabs.svelte';
	import { publisherTabs, publisherTabsIconsMap } from '$lib/db/dbConsts';
	import type { PublisherWorks } from '$lib/server/db/publishers/publishers';

	export let works: PublisherWorks;
	export let results: number;
	export let currentPage: number;
	export let totalPages: number;

	function getWorksMain(worksObj: PublisherWorks) {
		if (worksObj.type === 'books') {
			return worksObj.books;
		} else if (worksObj.type === 'series') {
			return worksObj.series;
		} else {
			return worksObj.releases;
		}
	}

	$: worksMain = getWorksMain(works);
</script>

<section class="flex flex-col gap-2">
	<Tabs tabs={publisherTabs} currentTab={works.type} tabsIcons={publisherTabsIconsMap} />

	<PaginationContainer
		{currentPage}
		{totalPages}
		results={worksMain.length > 0 ? results : undefined}
	>
		{#if worksMain.length > 0}
			{#if works.type === 'books'}
				<BookImageContainer moreColumns={true}>
					{#each works.books as book}
						<BookImage {book} urlPrefix="/book/">
							<BookImageBadge badges={book.publisher_type} />
						</BookImage>
					{/each}
				</BookImageContainer>
			{:else if works.type === 'series'}
				<BookImageContainer moreColumns={true}>
					{#each works.series as series}
						<BookImage
							book={{ title: series.title, id: series.id, image: series.book?.image }}
							urlPrefix="/series/"
						>
							<BookImageBadge badges={series.publisher_types} />
							{#if series.volumes}
								<BookImageBadge
									badges={[`${series.volumes.count} vols.`]}
									location="bottom-right"
								/>
							{/if}
						</BookImage>
					{/each}
				</BookImageContainer>
			{:else}
				{#each works.releases as release}
					<p>
						<a class="link" href="/release/{release.id}"
							>{release.title} - {release.release_date} - {release.publisher_type}</a
						>
					</p>
				{/each}
			{/if}
		{:else}
			<p class="italic">None</p>
		{/if}
	</PaginationContainer>
</section>