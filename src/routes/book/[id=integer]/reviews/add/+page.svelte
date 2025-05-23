<script lang="ts">
	import { buildImageUrl } from '$lib/components/book/book';
	import ReviewForm from '$lib/components/form/review/ReviewForm.svelte';
	import DbRouteShell from '$lib/components/layout/db/DBRouteShell.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import { getDisplayPrefsContext, getTitleDisplay } from '$lib/display/prefs';
	import { getBgImageStyle, getThemeContext } from '$lib/stores/themeStore';

	let { data } = $props();

	const theme = getThemeContext();
	const displayPrefs = getDisplayPrefsContext();
	let imageUrl = $derived(buildImageUrl(data.book.image?.filename));
	let bgImageStyle = $derived(getBgImageStyle($theme, imageUrl));
	let title = $derived(getTitleDisplay({ obj: data.book, prefs: $displayPrefs.title_prefs }));
</script>

<PageTitle title="Write a review for {title}" />

<DbRouteShell theme={$theme} {bgImageStyle}>
	<ReviewForm
		actionUrl="/book/{data.book.id}/reviews/add"
		userReviewForm={data.userReviewForm}
		{title}
		itemType={'book'}
		itemId={data.book.id}
	/>
</DbRouteShell>
