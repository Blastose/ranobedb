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

<div class="mt-4 grid grid-cols-1 @md:grid-cols-[5fr_2fr] gap-8 items-center">
	<div class="flex flex-col gap-2">
		<h1 class="font-bold text-4xl">Welcome to RanobeDB</h1>

		<div>
			<p class="sub-text-alt">
				We are a light novel database and our mission is to provide a comprehensive database of
				Japanese light novels and any official translations.
				<br />
				This website is an open, editable database and you can contribute new information or corrections
				to the database.
				<br />
			</p>

			<div class="pt-4 flex gap-2 sub-text-alt">
				<a href="/series" class="primary-btn">Browse series</a>
				<a href="/about" class="tet-btn">About RanobeDB</a>
			</div>

			<div class="pt-4 flex gap-x-6 gap-y-2 flex-wrap sub-text-alt">
				<div class="flex gap-1 text-sm items-center">
					<Icon name="book" /> 51K+ Total books
				</div>
				<div class="flex gap-1 text-sm items-center">
					<Icon name="bookshelf" /> 20K+ Book series
				</div>
			</div>
		</div>
	</div>

	<div class="hidden @md:block">
		<div class="grid @md:grid-cols-1 @lg:grid-cols-2 gap-1 items-center">
			{#if series_img_1}
				<a href="/series/{series_img_1.id}"
					><img
						loading="lazy"
						width={series_img_1.book?.image?.width}
						height={series_img_1.book?.image?.height}
						class="hidden @lg:block rounded-md rotate-[-3deg]"
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
						class="rounded-md rotate-[3deg]"
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
