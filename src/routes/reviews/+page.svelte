<script lang="ts">
	import TitleDisplay from '$lib/components/display/TitleDisplay.svelte';
	import Icon from '$lib/components/icon/Icon.svelte';
	import Cover from '$lib/components/image/Cover.svelte';
	import NoIndex from '$lib/components/layout/NoIndex.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import PaginationContainer from '$lib/components/pagination/PaginationContainer.svelte';
	import Spoilers from '$lib/components/review/Spoilers.svelte';
	import { relativeTime } from '$lib/utils/relative-time';

	let { data } = $props();

	let title = 'Reviews';
</script>

<PageTitle {title} />
<NoIndex />

<main class="container-rndb">
	<div class="flex flex-col gap-4">
		<h1 class="font-bold text-4xl">{title}</h1>

		<PaginationContainer
			currentPage={data.currentPage}
			totalPages={data.totalPages}
			showTopPages={true}
			results={data.count}
		>
			{#each data.reviews as review}
				<div class="grid grid-cols-[64px_1fr] @md:grid-cols-[72px_1fr] gap-4">
					<a href="/{review.item_type}/{review.item_id}">
						<Cover obj={review.obj!}></Cover>
					</a>
					<div>
						<p>
							<a href="/user/{review.user_id}" class="link">{review.username}</a> reviewed
							<a href="/review/{review.item_type}/{review.review_id}" class="link"
								><TitleDisplay obj={review.obj!} /></a
							>
							({review.item_type})
						</p>
						<div class="flex gap-2 items-center text-sm">
							{#if review.score}
								<p class="flex gap-1 items-center">
									<Icon class="text-[#ffa844]" name="star" height="18" width="18" />{review.score} /
									10
								</p>
								•
							{/if}
							<p class="sub-text-alt">
								{relativeTime(review.last_updated.getTime() / 1000)}
							</p>
						</div>
						{#if review.spoiler}
							<Spoilers />
						{/if}
					</div>
				</div>
			{/each}
		</PaginationContainer>
	</div>
</main>
