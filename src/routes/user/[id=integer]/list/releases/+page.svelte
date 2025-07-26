<script lang="ts">
	import { PUBLIC_IMAGE_URL } from '$env/static/public';
	import ReleaseOptions from '$lib/components/book/id/ReleaseOptions.svelte';
	import NameDisplay from '$lib/components/display/NameDisplay.svelte';
	import TitleDisplay from '$lib/components/display/TitleDisplay.svelte';
	import ReleaseFilters from '$lib/components/form/release/filters/ReleaseFilters.svelte';
	import Icon from '$lib/components/icon/Icon.svelte';
	import DbShell from '$lib/components/layout/db/DBShell.svelte';
	import ListTabs from '$lib/components/layout/list/ListTabs.svelte';
	import NoIndex from '$lib/components/layout/NoIndex.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import LangChip from '$lib/components/titles/LangChip.svelte';

	let { data } = $props();

	let pageTitle = $derived(
		data.isMyList ? 'My collection' : `${data.listUser.username}'s collection`,
	);

	const size = '24';
</script>

<PageTitle title={pageTitle} />
<NoIndex />

<DbShell
	name={pageTitle}
	customName={true}
	currentPage={data.currentPage}
	totalPages={data.totalPages}
	results={data.count}
	inputPlaceholder="Search by release title"
>
	{#snippet underHeading()}
		<ListTabs userIdNum={data.listUser.id_numeric} listCounts={data.listCounts} />
	{/snippet}
	{#snippet filters()}
		<ReleaseFilters
			filtersForm={data.filtersFormObj}
			isUser={Boolean(data.user)}
			isList={true}
			showSort={false}
			allowPublisherFiltersLogic={false}
		/>
	{/snippet}

	{#snippet display()}
		<div class="flex flex-col gap-2">
			{#each data.bookWithReleasesInList as book}
				<div>
					<div class="grid grid-cols-[48px_1fr] sm:grid-cols-[72px_1fr] gap-2 sm:gap-4">
						{#if book.image}
							<a class="mt-1" href="/book/{book.id}">
								{#key book.id}
									<img
										width={book.image.width}
										height={book.image.height}
										class="img rounded-md shadow-sm"
										src="{PUBLIC_IMAGE_URL}{book.image.filename}"
										alt=""
										loading="lazy"
									/>
								{/key}
							</a>
						{:else}
							<a
								class="bg-neutral-500 rounded-md flex items-center justify-center"
								href="/book/{book.id}"
							>
								<Icon name="book" height="24" width="24" />
							</a>
						{/if}
						<div>
							<p class="font-bold">
								<a class="link" href="/book/{book.id}"><TitleDisplay obj={book} /></a>
							</p>
							{#each book.releases as release}
								<div class="flex justify-between text-sm sm:text-base">
									<div
										class="grid gap-x-2 {data.userListReleaseForm
											? 'grid-cols-[24px_24px_102px_1fr]'
											: 'grid-cols-[24px_24px_72px_1fr]'}"
									>
										<LangChip lang={release.lang} />
										<div title={release.format}>
											{#if release.format === 'print'}
												<Icon name="bookW" height={size} width={size} />
											{:else if release.format === 'digital'}
												<Icon name="laptop" height={size} width={size} />
											{:else if release.format === 'audio'}
												<Icon name="headphones" height={size} width={size} />
											{/if}
										</div>
										{#if data.userListReleaseForm}
											<ReleaseOptions
												{release}
												showStatus={true}
												userListReleaseForm={data.userListReleaseForm}
											/>
										{:else}
											<p>{release.user_list_release?.release_status}</p>
										{/if}
										<a class="link line-clamp-2" href="/release/{release.id}"
											><NameDisplay obj={release} /></a
										>
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/snippet}
</DbShell>
