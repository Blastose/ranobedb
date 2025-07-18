<script lang="ts">
	import BookImage from '$lib/components/book/BookImage.svelte';
	import BookImageBadge from '$lib/components/book/BookImageBadge.svelte';
	import BookImageContainer from '$lib/components/layout/container/BookImageContainer.svelte';
	import PaginationContainer from '$lib/components/pagination/PaginationContainer.svelte';
	import Tabs from '$lib/components/tabs/Tabs.svelte';
	import { staffTabs, staffTabsIconsMap } from '$lib/db/dbConsts';
	import type { StaffWorks } from '$lib/server/db/staff/staff';

	interface Props {
		staffId: number;
		works: StaffWorks;
		results: string;
		currentPage: number;
		totalPages: number;
	}

	let { staffId, works, results, currentPage, totalPages }: Props = $props();

	let worksMain = $derived(works.type === 'books' ? works.books : works.series);
</script>

<section class="flex flex-col gap-2">
	<Tabs tabs={staffTabs} currentTab={works.type} tabsIcons={staffTabsIconsMap} />

	<a class="link w-fit" href="/{works.type}?staff={staffId}">Filter results</a>

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
							<BookImageBadge badges={[book.label?.label ?? '', ...book.role_types]} />
						</BookImage>
					{/each}
				</BookImageContainer>
			{:else}
				<BookImageContainer moreColumns={true}>
					{#each works.series as series (series.id)}
						<BookImage
							book={{
								title: series.title,
								id: series.id,
								lang: series.lang,
								romaji: series.romaji,
								image: series.book?.image,
							}}
							urlPrefix="/series/"
						>
							<BookImageBadge badges={[series.label?.label ?? '', ...series.role_types]} />
							{#if series.volumes}
								<BookImageBadge
									badges={[`${series.volumes.count} vols.`]}
									location="bottom-right"
								/>
							{/if}
						</BookImage>
					{/each}
				</BookImageContainer>
			{/if}
		{:else}
			<p class="italic">None</p>
		{/if}
	</PaginationContainer>
</section>
