<script lang="ts">
	import { buildImageUrl } from '$lib/components/book/book';
	import ReviewForm from '$lib/components/form/review/ReviewForm.svelte';
	import DbRouteShell from '$lib/components/layout/db/DBRouteShell.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import { getDisplayPrefsContext, getTitleDisplay } from '$lib/display/prefs';
	import { getBgImageStyle, getThemeContext } from '$lib/stores/themeStore';

	export let data;

	const theme = getThemeContext();
	const displayPrefs = getDisplayPrefsContext();
	$: imageUrl = buildImageUrl(data.series.books?.image?.filename);
	$: bgImageStyle = getBgImageStyle($theme, imageUrl);
	$: title = getTitleDisplay({ obj: data.series, prefs: $displayPrefs.title_prefs });
</script>

<PageTitle title="Write a review for {title}" />

<DbRouteShell theme={$theme} {bgImageStyle}>
	<ReviewForm
		actionUrl="/series/{data.series.id}/reviews/add"
		userReviewForm={data.userReviewForm}
		{title}
		itemType={'series'}
		itemId={data.series.id}
	/>
</DbRouteShell>
