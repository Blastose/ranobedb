<script lang="ts">
	export let book: { id: number; title: string; cover_image_file_name: string };
	export let coverUrl: string;
</script>

<div>
	<a class="h-min" href="/book/{book.id}" sveltekit:prefetch>
		<div class="flex flex-col gap-1">
			<img
				loading="lazy"
				class="shadow-md rounded-sm"
				src={coverUrl}
				alt="Cover image for {book.title}"
			/>
			<span class="dark:text-white clamp">{book.title}</span>
		</div>
	</a>
</div>

<style>
	.clamp {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
