<script lang="ts">
	import { PUBLIC_IMAGE_URL } from '$env/static/public';
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
	$: imageUrl = firstBookInSeries?.image?.filename
		? `${PUBLIC_IMAGE_URL}${firstBookInSeries?.image?.filename}`
		: null;
	$: bgImageStyle = getBgImageStyle($theme, imageUrl);
</script>

<PageTitle {title} />

<DbRouteShell theme={$theme} {bgImageStyle}>
	<Series revision={undefined} {series} user={data.user} />
</DbRouteShell>
