<script lang="ts">
	import BookRelease from '$lib/components/book/id/BookRelease.svelte';
	import ReleaseFilters from '$lib/components/form/release/filters/ReleaseFilters.svelte';
	import SubmitButton from '$lib/components/form/SubmitButton.svelte';
	import Hr from '$lib/components/layout/Hr.svelte';
	import NoIndex from '$lib/components/layout/NoIndex.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';

	let { data } = $props();

	let pageTitle = $derived(
		data.isMyList ? 'My upcoming releases' : `${data.listUser.username}'s upcoming releases`,
	);
</script>

<PageTitle title={pageTitle} />
<NoIndex />

<main class="container-rndb flex flex-col gap-4">
	<h1 class="text-4xl font-bold">{pageTitle}</h1>

	<div class="flex flex-col gap-2">
		<form method="get">
			<ReleaseFilters
				filtersForm={data.filtersFormObj}
				showSort={false}
				isList={false}
				isUser={false}
			>
				<div class="w-fit">
					<SubmitButton text="Filter" delayed={false} submitting={false} />
				</div>
			</ReleaseFilters>
		</form>

		{#if data.isMyList}
			<p>
				<a class="link" href="/releases/calendar?inUpcoming=on&date={data.currentYearMonth}"
					>Previous upcoming releases</a
				>
			</p>
		{/if}

		{#each Object.entries(data.groupedReleases) as [release_date, releases]}
			{@const [month, year] = release_date.split('|')}
			<section>
				{#if month !== '99'}
					<h2 class="font-bold flex justify-center">
						{Intl.DateTimeFormat('en', { month: 'long' }).format(
							new Date(0, Number(month) - 1, 15),
						)}
						{year}
					</h2>
				{:else}
					<h2 class="font-bold">{year === '9999' ? 'TBA' : year}</h2>
				{/if}
				{#each releases as release, index}
					<div>
						<BookRelease
							release={{ ...release, user_list_release: release.user_list_release || null }}
							userListReleaseForm={data.userListReleaseForm}
						/>
						{#if index !== releases.length - 1}<Hr />{/if}
					</div>
				{/each}
			</section>
		{/each}
	</div>
</main>
