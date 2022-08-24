<script lang="ts">
	import PersonBox from '$lib/book/PersonBox.svelte';
	import type BookInfo from '$lib/models/bookInfo';

	export let book: BookInfo;

	export let coverUrl: string;
</script>

<div
	class="bg-[#e4e7ee] dark:bg-[#38393a] p-2 rounded-sm grid grid-cols-[1fr_75%] md:grid-cols-[150px_1fr] gap-x-2 shadow-sm"
>
	<a class="h-min" href="/book/{book.id}" sveltekit:prefetch>
		<img loading="lazy" class="shadow-sm rounded-sm" src={coverUrl} alt="Cover for {book.title}" />
	</a>
	<div class="flex flex-col gap-2">
		<a href="/book/{book.id}" sveltekit:prefetch>
			<span class="font-bold md:text-xl dark:text-white">{book.title}</span>
		</a>
		<div class="flex flex-wrap gap-4">
			{#each book.authors as author (author.id)}
				<PersonBox person={author} type="author" />
			{/each}
			{#each book.artists as artist (artist.id)}
				<PersonBox person={artist} type="artist" />
			{/each}
		</div>
		<div
			class="
		relative overflow-hidden h-full
		
		after:w-full after:h-4 after:absolute after:left-0 after:bottom-0
		after:bg-gradient-to-t after:from-[#e4e7ee] dark:after:from-[#38393a]
		"
		>
			<p class="min-h-min max-h-[100px] sm:max-h-[150px] text-sm text-[#263147] dark:text-white">
				{@html book.description}
			</p>
		</div>
	</div>
</div>
