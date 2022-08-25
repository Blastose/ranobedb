<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';

	import type Release from '$lib/models/release';
	export let release: Release;
</script>

<div
	class="bg-[#e4e7ee] dark:bg-dark-500 dark:text-white rounded-md shadow-sm flex flex-col gap-1 px-4 py-2"
>
	<a href="/release/{release.id}" class="w-fit">
		<span title="Title" class="font-semibold">
			{release.name}
		</span>
	</a>
	<div class="grid grid-rows-4 gap-1 sm:gap-0 sm:grid-rows-none sm:grid-cols-4">
		<div class="flex gap-1 items-center">
			<Icon height="24" width="24" name="language" />
			<span title="Language">{release.lang}</span>
		</div>
		<div class="flex gap-1 items-center">
			<Icon height="24" width="24" name="calendarRange" />
			<span title="Release date">{release.release_date}</span>
		</div>
		<div class="flex gap-1 items-center">
			<Icon height="24" width="24" name="bookOpen" />
			<span title="Format">{release.format}</span>
		</div>
		<div class="flex gap-1 items-center">
			<Icon height="24" width="24" name="barcode" />
			<span title="ISBN13">{release.isbn13 || 'N/A'}</span>
		</div>
	</div>
</div>
