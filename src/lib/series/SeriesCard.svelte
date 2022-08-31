<script lang="ts">
	import PersonBox from '$lib/book/PersonBox.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import type SeriesInfo from '$lib/models/seriesInfo';
	import Box from './Box.svelte';
	export let series: SeriesInfo;
	export let coverUrl: string;
</script>

<div
	class="bg-primary-100 dark:bg-dark-500 p-2 rounded-sm grid grid-cols-[1fr_75%] md:grid-cols-[150px_1fr] gap-x-2 shadow-sm"
>
	<a class="h-min" href="/series/{series.id}" sveltekit:prefetch>
		<img
			loading="lazy"
			class="shadow-sm rounded-sm"
			src={coverUrl}
			alt="Cover for {series.title}"
		/>
	</a>
	<div class="flex flex-col gap-2">
		<a href="/series/{series.id}" sveltekit:prefetch>
			<span class="font-bold md:text-xl dark:text-white">{series.title}</span>
		</a>
		<div class="flex flex-wrap gap-2">
			<Box text={series.latest_release} title="Latest release date">
				<Icon height="24" width="24" name="calendarRange" />
			</Box>
			<Box text={series.volumes} title="Number of volumes">
				<Icon height="24" width="24" name="bookOpenPage" />
			</Box>
		</div>
		<div
			class="
		relative overflow-hidden h-full
		
		after:w-full after:h-4 after:absolute after:left-0 after:bottom-0
		after:bg-gradient-to-t after:from-primary-100 dark:after:from-dark-500
		"
		>
			<p class="min-h-min max-h-[100px] sm:max-h-[150px] text-sm dark:text-white">
				{@html series.description}
			</p>
		</div>
	</div>
</div>
