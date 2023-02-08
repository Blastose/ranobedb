<script lang="ts">
	import type { BookInfo } from '$lib/types/dbTypes';
	import { PUBLIC_IMAGE_URL } from '$env/static/public';
	import Box from '$lib/components/box/Box.svelte';

	export let book: BookInfo;
</script>

<div class="card-container">
	<a class="h-min" href="/book/{book.id}">
		<img
			loading="lazy"
			class="shadow-sm rounded-sm"
			src="{PUBLIC_IMAGE_URL}/{book.cover_image_file_name}.jpg"
			width="128"
			height="182"
			alt={book.title}
		/>
	</a>
	<div class="flex flex-col gap-2">
		<a href="/book/{book.id}">
			<p class="font-bold md:text-xl">{book.title}</p>
		</a>
		<div class="flex flex-wrap gap-2">
			{#each book.authors as author (author.id)}
				<Box text={author.name} href={`/person/${author.id}`} icon={'pencil'} />
			{/each}
			{#each book.artists as artist (artist.id)}
				<Box text={artist.name} href={`/person/${artist.id}`} icon={'palette'} />
			{/each}
		</div>
		<div class="description-container">
			<div class="markdown-text description">
				{@html book.description ?? ''}
			</div>
		</div>
	</div>
</div>

<style>
	.card-container {
		background-color: var(--primary-100);
		padding: 0.5rem;
		border-radius: 0.125rem;
		display: grid;
		grid-template-columns: 1fr 80%;
		column-gap: 0.5rem;
	}

	:global(.dark) .card-container {
		background-color: var(--dark-500);
	}

	.description-container {
		position: relative;
		overflow: hidden;
		height: 100%;
	}

	.description-container::after {
		content: '';
		width: 100%;
		height: 1.5rem;
		position: absolute;
		left: 0;
		bottom: 0;
		background-image: linear-gradient(to top, var(--primary-100), #ffffff00);
	}

	:global(.dark) .description-container::after {
		background-image: linear-gradient(to top, var(--dark-500), #ffffff00);
	}

	.description {
		min-height: min-content;
		max-height: 70px;
		font-size: 0.875rem;
		line-height: 1.25rem;
	}

	@media (min-width: 768px) {
		.card-container {
			grid-template-columns: 128px 1fr;
		}

		.description {
			max-height: 100px;
		}
	}
</style>
