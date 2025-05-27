<script lang="ts">
	import { buildImageUrl } from '$lib/components/book/book';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import ReviewOne from '$lib/components/review/ReviewOne.svelte';
	import { getDisplayPrefsContext, getTitleDisplay } from '$lib/display/prefs';

	let { data } = $props();

	const displayPrefs = getDisplayPrefsContext();
	let imageUrl = $derived(buildImageUrl(data.book.image?.filename));
	let book = $derived(data.book);
	let title = $derived(getTitleDisplay({ obj: book, prefs: $displayPrefs.title_prefs }));
</script>

<PageTitle title="Review for {title}"></PageTitle>

<ReviewOne
	{imageUrl}
	itemId={book.id}
	itemType="book"
	reviewSubjectTitle={title}
	review={data.review}
	userHasReview={data.isOwnReview}
/>
