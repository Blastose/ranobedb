<script lang="ts">
	import type Release from '$lib/models/release';
	export let release: Release;
</script>

<div class="bg-[#e4e7ee] rounded-md shadow-sm flex flex-col gap-1 px-4 py-2">
	<a href="/release/{release.id}" class="w-fit">
		<span title="Title" class="font-semibold">
			{release.name}
		</span>
	</a>
	<div class="grid grid-cols-2 sm:grid-cols-4">
		<span title="Language">{release.lang}</span>
		<span title="Release date">{release.release_date}</span>
		<span title="Format">{release.format}</span>
		<span title="ISBN13">{release.isbn13 || 'N/A'}</span>
	</div>
</div>
