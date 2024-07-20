<script lang="ts">
	import BookRelease from '$lib/components/book/id/BookRelease.svelte';
	import Hr from '$lib/components/layout/Hr.svelte';
	import ListTabs from '$lib/components/layout/list/ListTabs.svelte';
	import NoIndex from '$lib/components/layout/NoIndex.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';

	export let data;

	$: pageTitle = data.isMyList
		? 'My upcoming releases'
		: `${data.listUser.username}'s upcoming releases`;
</script>

<PageTitle title={pageTitle} />
<NoIndex />

<main class="container-rndb flex flex-col gap-4">
	<h1 class="text-4xl font-bold">{pageTitle}</h1>

	<ListTabs userIdNum={data.listUser.id_numeric} />

	<div class="flex flex-col gap-2">
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
