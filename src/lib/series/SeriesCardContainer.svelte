<script lang="ts">
	import type SeriesInfo from '$lib/models/seriesInfo';
	import { supabaseClient } from '$lib/db';
	import SeriesCard from './SeriesCard.svelte';

	export let series: SeriesInfo[];

	const getCover = (series: SeriesInfo) => {
		let { publicURL } = supabaseClient.storage
			.from('covers')
			.getPublicUrl(`${series.cover_image_file_name}.jpg`);

		return publicURL;
	};
</script>

<div class="grid grid-cols-1 lg:grid-cols-2 gap-2">
	{#each series as s (s.id)}
		<SeriesCard series={s} coverUrl={getCover(s)} />
	{/each}
</div>
