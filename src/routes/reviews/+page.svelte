<script lang="ts">
	import TitleDisplay from '$lib/components/display/TitleDisplay.svelte';
	import Icon from '$lib/components/icon/Icon.svelte';
	import Cover from '$lib/components/image/Cover.svelte';
	import NoIndex from '$lib/components/layout/NoIndex.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import PaginationContainer from '$lib/components/pagination/PaginationContainer.svelte';
	import Spoilers from '$lib/components/review/Spoilers.svelte';
	import { getDisplayPrefsContext, getTitleDisplay } from '$lib/display/prefs.js';
	import { relativeTime } from '$lib/utils/relative-time';

	let { data } = $props();

	let title = 'Reviews';
	const displayPrefs = getDisplayPrefsContext();
</script>

<PageTitle {title} />
<NoIndex />

<main class="container-rndb">
	<div class="flex flex-col gap-4">
		<h1 class="text-4xl font-bold">{title}</h1>

		<PaginationContainer
			currentPage={data.currentPage}
			totalPages={data.totalPages}
			showTopPages={true}
			results={data.count}
		>
			{#each data.reviews as review}
				<div class="grid grid-cols-[64px_1fr] gap-4 @md:grid-cols-[72px_1fr]">
					<a
						href="/{review.item_type}/{review.item_id}"
						aria-label={getTitleDisplay({ obj: review.obj!, prefs: $displayPrefs.title_prefs })}
					>
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
						<div class="flex items-center gap-2 text-sm">
							{#if review.score}
								<p class="flex items-center gap-1">
									<Icon class="text-[#ffa844]" name="star" height="18" width="18" />{Number(
										review.score,
									)} / 10
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
