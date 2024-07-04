<script lang="ts">
	import MetaTags from '$lib/components/layout/MetaTags.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import DbRouteShell from '$lib/components/layout/db/DBRouteShell.svelte';
	import Publisher from '$lib/components/publisher/id/Publisher.svelte';
	import { getDisplayPrefsContext, getNameDisplay } from '$lib/display/prefs.js';
	import { getThemeContext } from '$lib/stores/themeStore.js';

	export let data;

	$: publisher = data.publisher;
	$: title = getNameDisplay({ obj: publisher, prefs: $displayPrefs.names });

	const theme = getThemeContext();
	const displayPrefs = getDisplayPrefsContext();
</script>

<PageTitle {title} />
<MetaTags {title} description={publisher.description} site_name={'RanobeDB'} />

<DbRouteShell theme={$theme} bgImageStyle={null}>
	<Publisher
		{publisher}
		works={data.works}
		revision={undefined}
		user={data.user}
		currentPage={data.currentPage}
		results={data.count}
		totalPages={data.totalPages}
	/>
</DbRouteShell>
