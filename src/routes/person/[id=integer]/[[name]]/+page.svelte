<script lang="ts">
	import BookView from '$lib/components/book/BookView.svelte';
	import Icon from '$lib/components/icon/Icon.svelte';
	import Box from '$lib/components/box/Box.svelte';
	import TopBottomLayout from '$lib/components/layout/TopBottomLayout.svelte';
	import type { PageData } from './$types';
	import { page } from '$app/stores';

	export let data: PageData;
</script>

<svelte:head>
	<title>{data.person.person_name} - RanobeDB</title>
</svelte:head>

<TopBottomLayout backgroundCover={null}>
	<svelte:fragment slot="top">
		<p class="text-xl sm:text-3xl font-bold">{data.person.person_name}</p>
		<p class="text-lg sm:text-xl font-semibold">{data.person.person_name_romaji ?? ''}</p>
		<p class="text-sm sm:text-base font-semibold">Person</p>
	</svelte:fragment>

	<svelte:fragment slot="content">
		<div class="flex flex-col gap-4">
			<div>
				<p class="font-bold">Biography</p>
				<div class="markdown-text">
					{@html data.person.person_description || 'N/A'}
				</div>
			</div>
			<div class="w-min">
				<Box
					text={'Edit'}
					href={`/person/${$page.params.id}/edit`}
					icon={'pencil'}
					preload={false}
				/>
			</div>
		</div>

		<BookView books={data.books} />
	</svelte:fragment>
</TopBottomLayout>
