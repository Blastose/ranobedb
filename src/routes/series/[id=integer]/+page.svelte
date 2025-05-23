<script lang="ts">
	import { buildImageUrl } from '$lib/components/book/book.js';
	import MetaTags from '$lib/components/layout/MetaTags.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import DbRouteShell from '$lib/components/layout/db/DBRouteShell.svelte';
	import Series from '$lib/components/series/id/Series.svelte';
	import { getDisplayPrefsContext, getTitleDisplay } from '$lib/display/prefs.js';
	import { getBgImageStyle, getThemeContext } from '$lib/stores/themeStore.js';

	let { data } = $props();
	let series = $derived(data.series);

	const theme = getThemeContext();

	const displayPrefs = getDisplayPrefsContext();
	let title = $derived(getTitleDisplay({ obj: series, prefs: $displayPrefs.title_prefs }));

	let firstBookInSeries = $derived(series.books.at(0));
	let imageUrl = $derived(buildImageUrl(firstBookInSeries?.image?.filename));
	let bgImageStyle = $derived(getBgImageStyle($theme, imageUrl));
</script>

<PageTitle {title} />
<MetaTags
	{title}
	image={imageUrl}
	description={series.book_description?.description ?? ''}
	site_name={'RanobeDB'}
/>

<DbRouteShell theme={$theme} {bgImageStyle}>
	<Series
		revision={undefined}
		{series}
		user={data.user}
		userListSeriesForm={data.userListSeriesForm}
		userListBookBatchForm={data.userListBookBatchForm}
		allCustLabels={data.allCustLabels}
	/>
</DbRouteShell>
