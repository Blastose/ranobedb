<script lang="ts">
	import { buildImageUrl } from '$lib/components/book/book';
	import Description from '$lib/components/book/Description.svelte';
	import TitleDisplay from '$lib/components/display/TitleDisplay.svelte';
	import Icon from '$lib/components/icon/Icon.svelte';
	import DbRouteShell from '$lib/components/layout/db/DBRouteShell.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import PaginationContainer from '$lib/components/pagination/PaginationContainer.svelte';
	import { getDisplayPrefsContext, getTitleDisplay } from '$lib/display/prefs';
	import { getBgImageStyle, getThemeContext } from '$lib/stores/themeStore';

	export let data;

	const theme = getThemeContext();
	const displayPrefs = getDisplayPrefsContext();
	$: imageUrl = buildImageUrl(data.series.books?.image?.filename);
	$: bgImageStyle = getBgImageStyle($theme, imageUrl);
	$: series = data.series;
	$: title = getTitleDisplay({ obj: series, prefs: $displayPrefs.title_prefs });
</script>

<PageTitle title="Reviews for {title}"></PageTitle>

<DbRouteShell theme={$theme} {bgImageStyle}>
	<div class="flex flex-col gap-4 mt-4">
		<div>
			<h1 class="font-bold text-xl">Reviews for <TitleDisplay obj={data.series} type="main" /></h1>
			<a class="link" href="/series/{data.series.id}">Back to main series page</a>
		</div>

		<a class="sub-btn w-fit flex items-center gap-2" href="/series/{data.series.id}/reviews/add"
			><Icon name="pencil" height="20" width="20" />{data.userHasReview ? 'Edit your' : 'Write a'} review</a
		>

		<PaginationContainer
			currentPage={data.currentPage}
			totalPages={data.totalPages}
			results={data.count}
			showTopPages={false}
		>
			<div class="grid grid-cols-1 @md:grid-cols-2 gap-2 @sm:gap-4">
				{#each data.reviews as review (review.review_id)}
					<div class="flex flex-col gap-2">
						<div>
							<div class="flex justify-between">
								<p>
									By <a class="link" href="/user/{review.user_id}">{review.username}</a>
								</p>
								<time datetime="">{new Date(review.created).toLocaleDateString('sv')}</time>
							</div>
							<div class="flex gap-2 items-center">
								Score:
								<div class="flex">
									<Icon class="text-[#ffa844]" name="star" height="24" width="24" /> 10/10
								</div>
							</div>
						</div>

						<Description description={review.review_text} maxHeight={128} />
					</div>
				{/each}
			</div>
		</PaginationContainer>
	</div>
</DbRouteShell>
