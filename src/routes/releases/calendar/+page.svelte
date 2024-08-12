<script lang="ts">
	import BookRelease from '$lib/components/book/id/BookRelease.svelte';
	import HiddenInput from '$lib/components/form/HiddenInput.svelte';
	import SubmitButton from '$lib/components/form/SubmitButton.svelte';
	import ReleaseFilters from '$lib/components/form/release/filters/ReleaseFilters.svelte';
	import Hr from '$lib/components/layout/Hr.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import { page } from '$app/stores';
	import DateInput from './DateInput.svelte';

	export let data;

	const pageTitle = 'Releases Calendar';

	function buildLink(date: string, url: URL) {
		const newUrl = new URL(url);
		newUrl.searchParams.set('date', date);
		return newUrl.pathname + newUrl.search;
	}
</script>

<PageTitle title={pageTitle} />

<main class="container-rndb flex flex-col gap-4">
	<h1 class="text-4xl font-bold">{pageTitle}</h1>

	<div class="flex justify-between">
		<div>
			<a class="link" href={buildLink(data.prevMonth, $page.url)}>{'<-'} Previous month</a>
		</div>
		<div><a class="link" href={buildLink(data.nextMonth, $page.url)}>Next month {'->'}</a></div>
	</div>

	<div class="flex flex-col gap-2">
		<form method="get">
			<ReleaseFilters filtersForm={data.filtersForm} showSort={false}>
				<HiddenInput name="date" value={`${data.year}-${String(data.month).padStart(2, '0')}`} />

				<DateInput bind:vYear={data.year} bind:vMonth={data.month} />

				<div class="w-fit">
					<SubmitButton text="Filter" delayed={false} submitting={false} />
				</div>
			</ReleaseFilters>
		</form>

		<p>{data.count} results</p>

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
					<h2 class="font-bold">{year}</h2>
				{/if}
				{#each releases as release, index}
					<div>
						<BookRelease
							release={{ ...release, user_list_release: null }}
							userListReleaseForm={undefined}
							showMenus={false}
						/>
						{#if index !== releases.length - 1}<Hr />{/if}
					</div>
				{/each}
			</section>
		{/each}
	</div>
</main>
