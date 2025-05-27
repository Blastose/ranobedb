<script lang="ts">
	import { buildImageUrl } from '$lib/components/book/book';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import Reviews from '$lib/components/review/Reviews.svelte';
	import { getDisplayPrefsContext, getTitleDisplay } from '$lib/display/prefs';
	import { getThemeContext } from '$lib/stores/themeStore';

	let { data } = $props();

	const theme = getThemeContext();
	const displayPrefs = getDisplayPrefsContext();
	let imageUrl = $derived(buildImageUrl(data.book.image?.filename));
	let book = $derived(data.book);
	let title = $derived(getTitleDisplay({ obj: book, prefs: $displayPrefs.title_prefs }));
</script>

<PageTitle title="Reviews for {title}"></PageTitle>

<Reviews
	currentPage={data.currentPage}
	totalPages={data.totalPages}
	results={data.count}
	{imageUrl}
	itemId={book.id}
	itemType="book"
	reviews={data.reviews}
	userHasReview={data.userHasReview}
	reviewSubjectTitle={title}
/>
