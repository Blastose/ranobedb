<script lang="ts">
	import type { Release } from '$lib/types/dbTypes';
	import type { Selectable } from 'kysely';
	import Icon from '$lib/components/icon/Icon.svelte';

	export let release: Selectable<Release>;
</script>

<div class="release-container shadow-sm">
	<a href="/release/{release.id}" class="w-fit">
		<p title="Title" class="font-semibold">
			{release.name}
		</p>
	</a>
	<div class="grid-layout">
		<div class="card-item">
			<Icon height="24" width="24" name="language" />
			<p title="Language">{release.lang}</p>
		</div>
		<div class="card-item">
			<Icon height="24" width="24" name="calendarRange" />
			<p title="Release date">{release.release_date}</p>
		</div>
		<div class="card-item">
			<Icon height="24" width="24" name="bookOpen" />
			<p title="Format">{release.format}</p>
		</div>
		<div class="card-item">
			<Icon height="24" width="24" name="barcode" />
			<p title="ISBN13">{release.isbn13 ?? 'N/A'}</p>
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
