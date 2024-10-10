<script lang="ts">
	import { buildImageUrl } from '$lib/components/book/book';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import Reviews from '$lib/components/review/Reviews.svelte';
	import { getDisplayPrefsContext, getTitleDisplay } from '$lib/display/prefs';
	import { getThemeContext } from '$lib/stores/themeStore';

	export let data;

	const theme = getThemeContext();
	const displayPrefs = getDisplayPrefsContext();
	$: imageUrl = buildImageUrl(data.book.image?.filename);
	$: book = data.book;
	$: title = getTitleDisplay({ obj: book, prefs: $displayPrefs.title_prefs });
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
