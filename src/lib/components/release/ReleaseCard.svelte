<script lang="ts">
	import type { BookRelease } from '$lib/types/dbTypes';
	import Icon from '$lib/components/icon/Icon.svelte';
	import { convertDate } from '$lib/util/convertDate';

	export let bookRelease: BookRelease;
</script>

<div class="release-container shadow-sm">
	<a href="/release/{bookRelease.id}" class="w-fit">
		<p title="Title" class="font-semibold">
			{bookRelease.name}
		</p>
	</a>
	<div class="grid-layout">
		<div class="card-item">
			<Icon height="24" width="24" name="language" />
			<p title="Language">{bookRelease.lang}</p>
		</div>
		<div class="card-item">
			<Icon height="24" width="24" name="calendarRange" />
			<p title="Release date">{convertDate(bookRelease.release_date)}</p>
		</div>
		<div class="card-item">
			<Icon height="24" width="24" name="bookOpen" />
			<p title="Format">{bookRelease.format}</p>
		</div>
		<div class="card-item">
			<Icon height="24" width="24" name="barcode" />
			<p title="ISBN13">{bookRelease.isbn13 ?? 'N/A'}</p>
		</div>
	</div>
</div>

<style>
	.release-container {
		background-color: var(--primary-100);
		border-radius: 0.375rem;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 0.5rem 1rem;
	}

	.grid-layout {
		display: grid;
		grid-template-rows: repeat(4, minmax(0, 1fr));
		gap: 0.25rem;
	}

	:global(.dark) .release-container {
		background-color: var(--dark-500);
	}

	.card-item {
		display: flex;
		gap: 0.25rem;
		align-items: center;
	}

	@media (min-width: 640px) {
		.grid-layout {
			gap: 0;
			grid-template-rows: none;
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}
	}
</style>
