<script lang="ts">
	export let moreColumns: boolean = false;
</script>

<div class="books-container">
	<div class="book-image-container" class:more-columns={moreColumns}>
		<slot />
	</div>
</div>

<style>
	.books-container {
		container-type: inline-size;
		container-name: book-image-container;
	}

	.book-image-container {
		display: grid;
		gap: 0.75rem;
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}

	@container book-image-container (min-width: 640px) {
		.book-image-container {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}
	}
	@container book-image-container (min-width: 768px) {
		.book-image-container {
			grid-template-columns: repeat(5, minmax(0, 1fr));
		}
	}
	@container book-image-container (min-width: 1280px) {
		.book-image-container {
			grid-template-columns: repeat(6, minmax(0, 1fr));
		}
	}
	@container book-image-container (min-width: 1536px) {
		.book-image-container {
			grid-template-columns: repeat(8, minmax(0, 1fr));
		}
	}

	.book-image-container.more-columns {
		grid-template-columns: repeat(4, minmax(0, 1fr));
	}

	@container book-image-container (min-width: 640px) {
		.book-image-container.more-columns {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}
	}
	@container book-image-container (min-width: 768px) {
		.book-image-container.more-columns {
			grid-template-columns: repeat(6, minmax(0, 1fr));
		}
	}
	@container book-image-container (min-width: 1280px) {
		.book-image-container.more-columns {
			grid-template-columns: repeat(8, minmax(0, 1fr));
		}
	}
	@container book-image-container (min-width: 1536px) {
		.book-image-container.more-columns {
			grid-template-columns: repeat(8, minmax(0, 1fr));
		}
	}
</style>
