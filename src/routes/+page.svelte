<script lang="ts">
	import MetaTags from '$lib/components/layout/MetaTags.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import ReleaseBookImageCarousel from '$lib/components/release/ReleaseBookImageCarousel.svelte';
	import { buildRevisionLink, dbItemMap, getHistoryEntryTitle } from '$lib/db/revision.js';
	import { getDisplayPrefsContext } from '$lib/display/prefs.js';

	let { data } = $props();

	const displayPrefs = getDisplayPrefsContext();
</script>

<PageTitle title="Home" />

<MetaTags
	title="RanobeDB"
	description="Welcome to RanobeDB! We are a light novel database and our mission is to provide a comprehensive database of Japanese light novels and any official translations. This website is an open, editable database and you can contribute new information or corrections to the database."
	site_name="RanobeDB"
	type="website"
/>

<main class="container-rndb flex flex-col gap-4">
	<h1 class="font-bold text-4xl">Home</h1>

	<p>
		<span class="font-bold">Welcome to RanobeDB!</span>
		<br />
		We are a light novel database and our mission is to provide a comprehensive database of Japanese
		light novels and any official translations.
		<br />
		This website is an open, editable database and you can contribute new information or corrections
		to the database.
		<br />
		We are still is in alpha, so expect bugs and missing features.
		<br />
		See our <a href="/about" class="link">about page</a> for more info.
	</p>

	<section>
		<ReleaseBookImageCarousel releases={data.upcomingReleases} heading="Upcoming releases" />
	</section>

	<section>
		<ReleaseBookImageCarousel releases={data.recentlyReleased} heading="Recently released" />
	</section>

	<section>
		<h2 class="text-lg font-bold">Recent changes</h2>
		{#each data.recentChanges as recentChange}
			{@const link = buildRevisionLink(
				recentChange.item_name,
				recentChange.item_id,
				recentChange.revision,
			)}
			<div>
				{dbItemMap[recentChange.item_name]}{recentChange.item_id}
				<a href={link.href} class="link">{getHistoryEntryTitle(recentChange, $displayPrefs)}</a>
				by <a href="/user/{recentChange.id_numeric}" class="link">{recentChange.username}</a>
			</div>
		{/each}
	</section>
</main>
