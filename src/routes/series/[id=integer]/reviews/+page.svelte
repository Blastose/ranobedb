<script lang="ts">
	import { buildImageUrl } from '$lib/components/book/book';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import Reviews from '$lib/components/review/Reviews.svelte';
	import { getDisplayPrefsContext, getTitleDisplay } from '$lib/display/prefs';
	import { getThemeContext } from '$lib/stores/themeStore';

	let { data } = $props();

	const theme = getThemeContext();
	const displayPrefs = getDisplayPrefsContext();
	let imageUrl = $derived(buildImageUrl(data.series.books?.image?.filename));
	let series = $derived(data.series);
	let title = $derived(getTitleDisplay({ obj: series, prefs: $displayPrefs.title_prefs }));
</script>

<PageTitle title="Reviews for {title}"></PageTitle>

<Reviews
	currentPage={data.currentPage}
	totalPages={data.totalPages}
	results={data.count}
	{imageUrl}
	itemId={series.id}
	itemType="series"
	reviews={data.reviews}
	userHasReview={data.userHasReview}
	reviewSubjectTitle={title}
/>
