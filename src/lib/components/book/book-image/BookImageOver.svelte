<script lang="ts">
	import { PUBLIC_IMAGE_URL } from '$env/static/public';
	import type { BookImageType } from '$lib/components/book/book-image/BookImageContainer.svelte';

	export let book: BookImageType;
</script>

<div class="book-image">
	<a href="/book/{book.id}">
		<div class="image-container">
			<img
				loading="lazy"
				class="image rounded-sm"
				src="{PUBLIC_IMAGE_URL}/{book.cover_image_file_name}.jpg"
				width="240"
				height="343"
				alt=""
			/>
		</div>
		<div class="tint" />
		<div class="p-1">
			<p class="title">
				{book.title}
			</p>
		</div>
	</a>
</div>

<style>
	.tint {
		position: absolute;
		bottom: 0;
		height: 36%;
		width: 100%;
		transition-duration: 150ms;
		background: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 1));
	}

	@media (min-width: 1024px) {
		.tint {
			height: 30%;
		}
	}

	.book-image {
		position: relative;
		color: white;
	}

	.book-image:hover .tint {
		height: 45%;
		background: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 1));
	}

	.image-container {
		overflow: hidden;
	}

	.title {
		overflow: hidden;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		transition-duration: 150ms;
		position: absolute;
		bottom: 0;
	}

	.book-image:hover .title {
		bottom: 7px;
	}

	.image {
		transition-duration: 150ms;
	}

	.book-image:hover .image {
		transform: scale(1.05);
	}
</style>
