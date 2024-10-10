<script lang="ts">
	import { buildImageUrl } from '$lib/components/book/book';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import ReviewOne from '$lib/components/review/ReviewOne.svelte';
	import { getDisplayPrefsContext, getTitleDisplay } from '$lib/display/prefs';

	export let data;

	const displayPrefs = getDisplayPrefsContext();
	$: imageUrl = buildImageUrl(data.series.books?.image?.filename);
	$: series = data.series;
	$: title = getTitleDisplay({ obj: series, prefs: $displayPrefs.title_prefs });
</script>

<PageTitle title="Review for {title}"></PageTitle>

<ReviewOne
	{imageUrl}
	itemId={series.id}
	itemType="series"
	reviewSubjectTitle={title}
	review={data.review}
	userHasReview={data.isOwnReview}
/>
