<script lang="ts">
	import { PUBLIC_IMAGE_URL } from '$env/static/public';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import DbRouteShell from '$lib/components/layout/db/DBRouteShell.svelte';
	import Series from '$lib/components/series/id/Series.svelte';
	import { themeStore } from '$lib/stores/themeStore.js';

	export let data;
	$: series = data.series;

	// TODO refactor with Book.svelte
	$: firstBookInSeries = series.books.at(0);
	$: imageUrl = firstBookInSeries?.image?.filename
		? `${PUBLIC_IMAGE_URL}${firstBookInSeries?.image?.filename}`
		: null;
	$: imageBgStyle = imageUrl
		? ($themeStore ?? data.theme) === 'light'
			? `background-image: linear-gradient(rgba(242, 242, 242, 0.25) 0%, rgba(242, 242, 242, 1) 75%, rgba(242, 242, 242, 1) 100%), url(${imageUrl});`
			: `background-image: linear-gradient(rgba(34, 34, 34, 0.7) 0%, rgba(34, 34, 34, 1) 90%, rgba(34, 34, 34, 1) 100%), url(${imageUrl});`
		: '';
</script>

<PageTitle title={series.title ?? ''} />

<DbRouteShell theme={$themeStore ?? data.theme} {imageBgStyle}>
	<Series isRevision={false} {series} user={data.user} />
</DbRouteShell>
