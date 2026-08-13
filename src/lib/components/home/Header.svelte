<script lang="ts">
	import { PUBLIC_IMAGE_URL } from '$env/static/public';
	import Icon from '$lib/components/icon/Icon.svelte';
	import { getDisplayPrefsContext, getTitleDisplay } from '$lib/display/prefs';
	import type { PageProps } from '../../../routes/$types';

	let { data }: { data: PageProps['data'] } = $props();

	const displayPrefs = getDisplayPrefsContext();

	let series_img_1 = $derived(data.mostPopularSeries.at(6));
	let series_img_2 = $derived(data.mostPopularSeries.at(7));
</script>

<div class="mt-4 grid grid-cols-1 items-center gap-8 @md:grid-cols-[5fr_2fr]">
	<div class="flex flex-col gap-2">
		<h1 class="text-4xl font-bold">Welcome to RanobeDB</h1>

		<div>
			<p class="sub-text-alt">
				We are a light novel database and our mission is to provide a comprehensive database of
				Japanese light novels and any official translations.
				<br />
				This website is an open, editable database and you can contribute new information or corrections
				to the database.
				<br />
				The site is for tracking and data purposes only; we do not host or provide any reading material.
			</p>

			<div class="sub-text-alt flex gap-2 pt-4">
				<a href="/series" class="primary-btn">Browse series</a>
				<a href="/about" class="tet-btn">About RanobeDB</a>
			</div>

			<div class="sub-text-alt flex flex-wrap gap-x-6 gap-y-2 pt-4">
				<div class="flex items-center gap-1 text-sm">
					<Icon name="book" /> 51K+ Total books
				</div>
				<div class="flex items-center gap-1 text-sm">
					<Icon name="bookshelf" /> 20K+ Book series
				</div>
			</div>
		</div>
	</div>

	<div class="hidden @md:block">
		<div class="grid items-center gap-1 @md:grid-cols-1 @lg:grid-cols-2">
			{#if series_img_1}
				<a href="/series/{series_img_1.id}"
					><img
						loading="lazy"
						width={series_img_1.book?.image?.width}
						height={series_img_1.book?.image?.height}
						class="hidden rotate-[-3deg] rounded-md @lg:block"
						src="{PUBLIC_IMAGE_URL}{series_img_1.book?.image?.filename}"
						alt="Cover image for {getTitleDisplay({
							obj: series_img_1,
							prefs: $displayPrefs.title_prefs,
						})}"
					/>
				</a>
			{/if}
			{#if series_img_2}
				<a href="/series/{series_img_2.id}">
					<img
						loading="lazy"
						width={series_img_2.book?.image?.width}
						height={series_img_2.book?.image?.height}
						class="rotate-[3deg] rounded-md"
						src="{PUBLIC_IMAGE_URL}{series_img_2.book?.image?.filename}"
						alt="Cover image for {getTitleDisplay({
							obj: series_img_2,
							prefs: $displayPrefs.title_prefs,
						})}"
					/>
				</a>
			{/if}
		</div>
	</div>
</div>
