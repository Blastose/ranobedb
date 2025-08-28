<script lang="ts">
	import Hr from '$lib/components/layout/Hr.svelte';
	import MetaTags from '$lib/components/layout/MetaTags.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import ReleaseBookImageCarousel from '$lib/components/release/ReleaseBookImageCarousel.svelte';
	import Header from '$lib/components/home/Header.svelte';
	import PopularSeries from '$lib/components/home/PopularSeries.svelte';
	import Reviews from '$lib/components/home/Reviews.svelte';
	import RecentChanges from '$lib/components/home/RecentChanges.svelte';
	import Annoucements from '$lib/components/home/Annoucements.svelte';
	import SeasonalAnime from '$lib/components/home/SeasonalAnime.svelte';

	let { data } = $props();
</script>

<PageTitle title="Home" />

<MetaTags
	title="RanobeDB"
	description="Welcome to RanobeDB! We are a light novel database and our mission is to provide a comprehensive database of Japanese light novels and any official translations. This website is an open, editable database and you can contribute new information or corrections to the database."
	site_name="RanobeDB"
	type="website"
/>

<main class="container-rndb flex flex-col gap-12">
	{#if !data.user || data.homeDisplaySettings?.header}
		<Header {data} />
		<Hr />
	{/if}

	{#if !data.user || data.homeDisplaySettings?.popular_series}
		<PopularSeries {data} />
	{/if}

	{#if !data.user || data.homeDisplaySettings?.reviews}
		<Reviews {data} />
	{/if}

	{#if !data.user || data.homeDisplaySettings?.upcoming_releases}
		<section>
			<ReleaseBookImageCarousel releases={data.upcomingReleases} heading="Upcoming releases" />
		</section>
	{/if}

	{#if !data.user || data.homeDisplaySettings?.recently_released}
		<section>
			<ReleaseBookImageCarousel releases={data.recentlyReleased} heading="Recently released" />
		</section>
	{/if}

	{#if !data.user || data.homeDisplaySettings?.seasonal_anime}
		<SeasonalAnime {data} />
	{/if}

	{#if !data.user || data.homeDisplaySettings?.annoucements}
		<Annoucements />
	{/if}

	{#if !data.user || data.homeDisplaySettings?.recent_changes}
		<RecentChanges {data} />
	{/if}
</main>
