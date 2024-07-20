<script lang="ts">
	import { buildImageUrl } from '$lib/components/book/book.js';
	import MetaTags from '$lib/components/layout/MetaTags.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import DbRouteShell from '$lib/components/layout/db/DBRouteShell.svelte';
	import Series from '$lib/components/series/id/Series.svelte';
	import { getDisplayPrefsContext, getTitleDisplay } from '$lib/display/prefs.js';
	import { getBgImageStyle, getThemeContext } from '$lib/stores/themeStore.js';

	export let data;
	$: series = data.series;

	const theme = getThemeContext();

	const displayPrefs = getDisplayPrefsContext();
	$: title = getTitleDisplay({ obj: series, prefs: $displayPrefs.title_prefs });

	$: firstBookInSeries = series.books.at(0);
	$: imageUrl = buildImageUrl(firstBookInSeries?.image?.filename);
	$: bgImageStyle = getBgImageStyle($theme, imageUrl);
</script>

<PageTitle {title} />
<MetaTags {title} image={imageUrl} description={series.description} site_name={'RanobeDB'} />

<DbRouteShell theme={$theme} {bgImageStyle}>
	<Series
		revision={undefined}
		{series}
		user={data.user}
		userListSeriesForm={data.userListSeriesForm}
	/>
</DbRouteShell>
