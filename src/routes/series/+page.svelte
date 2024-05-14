<script lang="ts">
	import BookImage from '$lib/components/book/BookImage.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import BookImageContainer from '$lib/components/layout/container/BookImageContainer.svelte';
	import DbShell from '$lib/components/layout/db/DBShell.svelte';
	import LinkBox from '$lib/components/layout/db/LinkBox.svelte';

	export let data;
</script>

<PageTitle title="Series" />

<DbShell
	name="series"
	currentPage={data.currentPage}
	totalPages={data.totalPages}
	results={data.count}
	inputPlaceholder="Search by series title"
>
	<svelte:fragment slot="display">
		<div>
			<BookImageContainer>
				{#each data.series as series (series.id)}
					{#if series.book}
						<BookImage
							book={{ title: series.title, id: series.id, image: series.book.image }}
							urlPrefix="/series/"
						/>
					{:else}
						<LinkBox display={series.title ?? ''} href="/series/{series.id}" />
					{/if}
				{/each}
			</BookImageContainer>
		</div>
	</svelte:fragment>
</DbShell>
