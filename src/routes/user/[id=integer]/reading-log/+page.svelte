<script lang="ts">
	import NoIndex from '$lib/components/layout/NoIndex.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import { page } from '$app/state';
	import TitleDisplay from '$lib/components/display/TitleDisplay.svelte';
	import Cover from '$lib/components/image/Cover.svelte';
	import Icon from '$lib/components/icon/Icon.svelte';

	let { data } = $props();

	// TODO - Duplicate function of the one on releases calendar page
	function buildLink(date: string, url: URL) {
		const newUrl = new URL(url);
		newUrl.searchParams.set('date', date);
		return newUrl.pathname + newUrl.search;
	}

	let pageTitle = $derived(
		data.isCurrentUser ? 'My reading log' : `${data.listUser.username}'s reading log`,
	);
</script>

<PageTitle title={pageTitle} />
<NoIndex />

<main class="container-rndb flex flex-col gap-4">
	<h1 class="font-bold text-4xl">{pageTitle}</h1>

	<a href="/user/{data.listUser.id_numeric}" class="w-fit link px-2">To profile</a>

	<div class="flex flex-col gap-2">
		<h2 class="font-bold text-2xl">{data.currentMonthName} {data.currentYearName}</h2>

		<a href="/user/{data.listUser.id_numeric}/reading-log" class="text-sm w-fit tet-btn"
			>Jump to current month</a
		>
		<div class="flex justify-between">
			<p>
				<a class="link" href={buildLink(data.prevMonth, page.url)}>{'<-'} Previous month</a>
			</p>
			<p>
				<a class="link" href={buildLink(data.nextMonth, page.url)}>Next month {'->'}</a>
			</p>
		</div>
	</div>

	<section class="flex flex-col gap-1">
		<h2 class="font-bold">Books read by month</h2>
		<div class="read-window gap-1 @md:gap-4 text-center">
			{#each data.readPerMonthQuery.map((v) => ({ ...v, date: v.date.replace(/-01$/, '') })) as q}
				<a class="flex flex-col" href="/user/{data.listUser.id_numeric}/reading-log?date={q.date}">
					<div class="flex flex-col">
						<div class="h-16">
							<div class="h-full grid grid-rows-2">
								<div class="text-center text-sm">{q.count}</div>
								<div class="flex flex-col">
									<div class="flex-grow"></div>
									<div
										style="height: {(q.count /
											Math.max(...data.readPerMonthQuery.map((v) => v.count))) *
											100}%;"
										class="bg-[var(--primary-500)] rounded-t-md"
									></div>
								</div>
							</div>
						</div>
						<div
							class="text-xs flex flex-col {data.currentMonth === q.date ? 'font-bold link' : ''}"
						>
							<span>
								{q.monthName}
							</span>
							<span>{q.monthYear}</span>
						</div>
					</div>
				</a>
			{/each}
		</div>
	</section>

	<div>
		<p class="font-semibold sub-text-alt">Books read this month</p>
		<p class="font-bold text-3xl">{data.books.length}</p>
	</div>

	{#if data.books.length > 0}
		<div class="flex flex-col gap-2">
			<h3 class="font-bold text-lg">Books</h3>

			<div class="grid grid-cols-1 @sm:grid-cols-2 @md:grid-cols-3 gap-4">
				{#each data.books as book}
					<div class="grid grid-cols-[64px_1fr] gap-2">
						<a href="/book/{book.id}">
							<Cover obj={book} />
						</a>
						<div>
							<div class="font-semibold text-sm">
								<a href="/book/{book.id}">
									<TitleDisplay obj={book}></TitleDisplay>
								</a>
							</div>
							{#if book.score}
								<p class="flex items-center gap-1 text-sm sub-text-alt">
									<Icon class="text-[#ffa844]" name="star" height="18" width="18" />{book.score} / 10
								</p>
							{/if}
							<p class="flex items-center gap-1 text-sm sub-text-alt">
								<Icon name="clockOutline" height="18" width="18" />{book.finished}
							</p>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</main>

<style>
	.read-window {
		display: grid;
		grid-template-columns: repeat(13, minmax(0, 1fr));
	}
</style>
