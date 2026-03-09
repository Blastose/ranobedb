<script lang="ts">
	import { buildImageUrl } from '$lib/components/book/book.js';
	import MetaTags from '$lib/components/layout/MetaTags.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import DbRouteShell from '$lib/components/layout/db/DBRouteShell.svelte';
	import Release from '$lib/components/release/id/Release.svelte';
	import { getBgImageStyle, getThemeContext } from '$lib/stores/themeStore.js';
	import { getReleaseTitleDisplay, getDisplayPrefsContext } from '$lib/display/prefs.js';

	let { data } = $props();

	const theme = getThemeContext();
	const diplayPrefs = getDisplayPrefsContext();

	let release = $derived(data.release);
	let title = $derived(getReleaseTitleDisplay({ obj: release, prefs: $diplayPrefs }));

	let firstBookInReleases = $derived(release.books.at(0));
	let imageUrl = $derived(buildImageUrl(firstBookInReleases?.image?.filename));
	let bgImageStyle = $derived(getBgImageStyle($theme, imageUrl));
</script>

<PageTitle {title} />
<MetaTags {title} image={imageUrl} description={release.description} site_name={'RanobeDB'} />

<DbRouteShell theme={$theme} {bgImageStyle}>
	<Release
		revision={undefined}
		{release}
		user={data.user}
		userListReleaseForm={data.userListReleaseForm}
	/>
</DbRouteShell>
