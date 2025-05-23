<script lang="ts">
	import BookImage from '$lib/components/book/BookImage.svelte';
	import BookImageBadge from '$lib/components/book/BookImageBadge.svelte';
	import NameDisplay from '$lib/components/display/NameDisplay.svelte';
	import { DateNumber } from '$lib/components/form/release/releaseDate';
	import BookImageContainer from '$lib/components/layout/container/BookImageContainer.svelte';
	import PaginationContainer from '$lib/components/pagination/PaginationContainer.svelte';
	import Tabs from '$lib/components/tabs/Tabs.svelte';
	import { publisherTabs, publisherTabsIconsMap } from '$lib/db/dbConsts';
	import type { PublisherWorks } from '$lib/server/db/publishers/publishers';

	interface Props {
		publisherId: number;
		works: PublisherWorks;
		results: string;
		currentPage: number;
		totalPages: number;
	}

	let { publisherId, works, results, currentPage, totalPages }: Props = $props();

	function getWorksMain(worksObj: PublisherWorks) {
		if (worksObj.type === 'books') {
			return worksObj.books;
		} else if (worksObj.type === 'series') {
			return worksObj.series;
		} else {
			return worksObj.releases;
		}
	}

	let worksMain = $derived(getWorksMain(works));
</script>

<section class="flex flex-col gap-2">
	<Tabs tabs={publisherTabs} currentTab={works.type} tabsIcons={publisherTabsIconsMap} />

	<div class="flex flex-col">
		<a class="link w-fit" href="/{works.type}?p={publisherId}">Filter results</a>

		{#if works.type === 'releases'}
			<a class="link w-fit" href="/releases/calendar?p={publisherId}">View in Release calendar</a>
		{/if}
	</div>

	<PaginationContainer
		{currentPage}
		{totalPages}
		results={worksMain.length > 0 ? results : undefined}
	>
		{#if worksMain.length > 0}
			{#if works.type === 'books'}
				<BookImageContainer moreColumns={true}>
					{#each works.books as book (book.id)}
						<BookImage {book} urlPrefix="/book/">
							<BookImageBadge badges={book.publisher_type} />
						</BookImage>
					{/each}
				</BookImageContainer>
			{:else if works.type === 'series'}
				<BookImageContainer moreColumns={true}>
					{#each works.series as series (series.id)}
						<BookImage
							book={{
								title: series.title,
								romaji: series.romaji,
								lang: series.lang,
								id: series.id,
								image: series.book?.image,
							}}
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
				<div>
					{#each works.releases as release (release.id)}
						<p>
							<a class="link" href="/release/{release.id}"
								>{new DateNumber(release.release_date).getDateFormatted()} - <NameDisplay
									obj={release}
								/> - {release.publisher_type}</a
							>
						</p>
					{/each}
				</div>
			{/if}
		{:else}
			<p class="italic">None</p>
		{/if}
	</PaginationContainer>
</section>
