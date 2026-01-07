<script lang="ts">
	import NoIndex from '$lib/components/layout/NoIndex.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import Stats from '$lib/components/shared/Stats.svelte';
	import { getDisplayPrefsContext, getTitleDisplay } from '$lib/display/prefs.js';

	let { data } = $props();

	let book = $derived(data.book);

	const displayPrefs = getDisplayPrefsContext();

	let title = $derived(
		`Stats for ${getTitleDisplay({ obj: book, prefs: $displayPrefs.title_prefs })}`,
	);
</script>

<PageTitle {title} />
<NoIndex />

<main class="container-rndb">
	<Stats
		stats={data.stats}
		currentPage={data.currentPage}
		totalPages={data.totalPages}
		form={data.form}
		id={book.id}
		type="book"
		{title}
	/>
</main>
