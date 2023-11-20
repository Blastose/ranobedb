<script lang="ts">
	import type { Book } from '$lib/server/dbHelpers';

	export let book: Book;
</script>

<div class="bg-[var(--bg-light1)] dark:bg-[var(--bg-dark1)] p-2 rounded-sm shadow-sm">
	<div class="title-container">
		{#if book.filename}
			<img
				width="240"
				height="360"
				class="img rounded-sm shadow-sm"
				src="/covers_temp/{book.filename}.jpg"
				alt=""
			/>
		{/if}
		<h4 class="flex flex-col gap-2">
			{#each book.titles.filter((v) => v.lang === 'jp' && v.official).slice(0, 1) as title}
				<a class="line-clamp-2 font-bold text-lg" href="/book/{book.id}">{title.title}</a>
			{/each}
			<!-- 
			<div class="persons-container">
				{#each book.persons as person}
					<p>
						<a href="/person/{person.person_id}">{person.name} - {person.role_type}</a>
					</p>
				{/each}
			</div> -->

			<p class="line-clamp-4">
				{book.description_jp}
			</p>
		</h4>
	</div>
</div>

<style>
	.title-container {
		display: grid;
		grid-template-columns: 100px 1fr;
		gap: 0.75rem;
	}

	.persons-container {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
</style>
