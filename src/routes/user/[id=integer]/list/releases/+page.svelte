<script lang="ts">
	import { PUBLIC_IMAGE_URL } from '$env/static/public';
	import ReleaseOptions from '$lib/components/book/id/ReleaseOptions.svelte';
	import NameDisplay from '$lib/components/display/NameDisplay.svelte';
	import TitleDisplay from '$lib/components/display/TitleDisplay.svelte';
	import Icon from '$lib/components/icon/Icon.svelte';
	import ListTabs from '$lib/components/layout/list/ListTabs.svelte';
	import NoIndex from '$lib/components/layout/NoIndex.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';

	export let data;

	$: pageTitle = data.isMyList ? 'My collection' : `${data.listUser.username}'s collection`;

	const size = '24';
</script>

<PageTitle title={pageTitle} />
<NoIndex />

<main class="container-rndb flex flex-col gap-4">
	<h1 class="text-4xl font-bold">{pageTitle}</h1>

	<ListTabs userIdNum={data.listUser.id_numeric} />

	<div class="flex flex-col gap-2">
		{#each data.bookWithReleasesInList as book}
			<!-- TODO might be better to filter out the books without releases in list in SQL -->
			{#if book.releases.length > 0}
				<div>
					<div class="grid grid-cols-[56px_1fr] sm:grid-cols-[72px_1fr] gap-2 sm:gap-4">
						{#if book.image}
							<a class="mt-1" href="/book/{book.id}">
								<img
									width={book.image.width}
									height={book.image.height}
									class="img rounded-md shadow-sm"
									src="{PUBLIC_IMAGE_URL}{book.image.filename}"
									alt=""
									loading="lazy"
								/>
							</a>
						{/if}
						<div>
							<p class="font-bold">
								<a class="link" href="/book/{book.id}"><TitleDisplay obj={book} /></a>
							</p>
							{#each book.releases as release}
								<div class="flex justify-between">
									<div class="grid grid-cols-[18px_24px_102px_1fr] gap-x-2">
										<p>{release.lang}</p>
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
										<a class="link" href="/release/{release.id}"><NameDisplay obj={release} /></a>
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>
			{/if}
		{/each}
	</div>
</main>
