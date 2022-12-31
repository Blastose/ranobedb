<script lang="ts">
	import { PUBLIC_IMAGE_URL } from '$env/static/public';
	import type { BookInfo } from '$lib/types/dbTypes';

	export let book: BookInfo;
	export let hover = true;
	export let drag = true;
	export let scroll = false;
</script>

<div class="book-image">
	<a class="h-min {scroll ? 'pointer-events-none' : ''}" href="/book/{book.id}" draggable={drag}>
		<div class="flex flex-col gap-1">
			<div class="image-container">
				<img
					loading="lazy"
					draggable={drag}
					class="{hover ? 'image' : ''} rounded-sm"
					src="{PUBLIC_IMAGE_URL}/{book.cover_image_file_name}.jpg"
					width="240px"
					height="343px"
					alt=""
				/>
			</div>
			<p class="title">{book.title}</p>
		</div>
	</a>
</div>

<style>
	.image-container {
		overflow: hidden;
	}

	.title {
		overflow: hidden;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		transition-duration: 150ms;
	}

	.image {
		transition-duration: 150ms;
	}

	.image:hover {
		transform: scale(1.02);
	}
</style>
