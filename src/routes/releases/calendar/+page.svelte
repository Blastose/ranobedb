<script lang="ts">
	import BookRelease from '$lib/components/book/id/BookRelease.svelte';
	import HiddenInput from '$lib/components/form/HiddenInput.svelte';
	import SubmitButton from '$lib/components/form/SubmitButton.svelte';
	import ReleaseFilters from '$lib/components/form/release/filters/ReleaseFilters.svelte';
	import Hr from '$lib/components/layout/Hr.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import { page } from '$app/stores';
	import DateInput from './DateInput.svelte';
	import Cover from '$lib/components/image/Cover.svelte';
	import BookImageBadge from '$lib/components/book/BookImageBadge.svelte';
	import { DateNumber } from '$lib/components/form/release/releaseDate';
	import BookImageContainer from '$lib/components/layout/container/BookImageContainer.svelte';
	import NameDisplay from '$lib/components/display/NameDisplay.svelte';
	import { getRelCalStoreContext } from '$lib/stores/releaseCalendarViewStore';
	import { getDisplayPrefsContext, getNameDisplay } from '$lib/display/prefs';

	let { data = $bindable() } = $props();

	const pageTitle = 'Releases Calendar';

	const relCalView = getRelCalStoreContext();
	const displayPrefs = getDisplayPrefsContext();

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
			<ReleaseFilters
				filtersForm={data.filtersFormObj}
				showSort={false}
				isUser={Boolean(data.user)}
				isList={false}
				isCalendar={true}
			>
				<HiddenInput name="date" value={`${data.year}-${String(data.month).padStart(2, '0')}`} />

				<DateInput bind:vYear={data.year} bind:vMonth={data.month} />

				<div class="w-fit">
					<SubmitButton text="Filter" delayed={false} submitting={false} />
				</div>
			</ReleaseFilters>
		</form>

		<p>{data.count} results</p>

		<button
			class="w-fit sub-btn"
			onclick={() => {
				if ($relCalView === 'compact') {
					relCalView.set('grid');
				} else {
					relCalView.set('compact');
				}
			}}>Switch view</button
		>

		{#each Object.entries(data.groupedReleases) as [release_date, releases]}
			{@const [month, year] = release_date.split('|')}
			<section class="flex flex-col gap-2">
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
				{#if $relCalView === 'compact'}
					<div>
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
					</div>
				{:else}
					<BookImageContainer moreColumns={true}>
						{#each releases as release}
							{@const releaseDate = new DateNumber(release.release_date).getDateFormatted()}
							<a href="/release/{release.id}" class="flex flex-col gap-1">
								<Cover obj={release}>
									<BookImageBadge badges={[releaseDate]} />
									<BookImageBadge badges={[release.format]} location="bottom-right" />
								</Cover>
								<p
									title={getNameDisplay({ obj: release, prefs: $displayPrefs.names })}
									class="line-clamp-2"
								>
									<NameDisplay obj={release} />
								</p>
							</a>
						{/each}
					</BookImageContainer>
				{/if}
			</section>
		{/each}
	</div>
</main>
