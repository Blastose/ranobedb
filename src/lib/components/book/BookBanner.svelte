<script lang="ts">
	import type { BookInfo } from '$lib/types/dbTypes';
	import { PUBLIC_IMAGE_URL } from '$env/static/public';

	export let book: BookInfo;
</script>

<div
	class="backdrop-image"
	style={`background-image: url("${PUBLIC_IMAGE_URL}/${book.cover_image_file_name}.jpg");`}
>
	<div class="banner-container">
		<a class="h-min" href="/book/{book.id}">
			<img
				loading="lazy"
				class="rounded-sm"
				src="{PUBLIC_IMAGE_URL}/{book.cover_image_file_name}.jpg"
				width="240px"
				height="343px"
				alt="Cover for {book.title}"
			/>
		</a>
		<div class="flex flex-col gap-2">
			<a href="/book/{book.id}">
				<p class="title font-bold text-xl sm:text-2xl md:text-4xl">{book.title}</p>
			</a>
			<div class="flex flex-wrap gap-2 font-semibold">
				{#each book.authors as author (author.id)}
					<p>{author.name}</p>
				{/each}
				{#each book.artists as artist (artist.id)}
					<p>{artist.name}</p>
				{/each}
			</div>
			<div class="hidden sm:block">
				<p class="description text-sm md:text-base">
					{@html book.description}
				</p>
			</div>
		</div>
	</div>
</div>

<style>
	.backdrop-image {
		width: 100%;
		background-repeat: no-repeat;
		background-size: cover;
		background-position: 20% 20%;
		border-radius: 0.375rem;
		overflow: hidden;
		box-shadow: inset 0 0 0 1000px rgba(255, 255, 255, 0.7);
	}

	:global(.dark) .backdrop-image {
		box-shadow: inset 0 0 0 1000px rgba(0, 0, 0, 0.7);
	}

	.banner-container {
		display: grid;
		padding: 1.5rem;
		column-gap: 0.75rem;
		grid-template-columns: 110px 1fr;
		backdrop-filter: blur(16px);
		height: 13rem;
		transition-duration: 150ms;
	}

	.title {
		overflow: hidden;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
	}

	.description {
		overflow: hidden;
		display: -webkit-box;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical;
	}

	@media (min-width: 640px) {
		.banner-container {
			grid-template-columns: 125px 1fr;
			height: 15rem;
		}

		.description {
			-webkit-line-clamp: 3;
		}
	}

	@media (min-width: 768px) {
		.banner-container {
			grid-template-columns: 175px 1fr;
			height: 20rem;
		}

		.description {
			-webkit-line-clamp: 4;
		}
	}
</style>
