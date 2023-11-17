<script lang="ts">
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	export let data;
</script>

<PageTitle title="Books" />

<main class="container-rndb flex flex-col gap-4">
	<h1 class="font-bold text-4xl">Books</h1>

	{#each data.books as book}
		<div>
			<div class="title-container">
				{#if book.filename}
					<img
						width="240"
						height="360"
						class="img rounded-sm shadow-sm"
						src="https://f004.backblazeb2.com/file/ranobedb/covers/00330198-bc5c-4762-943a-066a1ef647ae.jpg"
						alt=""
					/>
				{/if}
				<h4>
					{#each book.titles.filter((v) => v.lang === 'jp' && v.official).slice(0, 1) as title}
						<a href="/book/{book.id}">{title.title}</a>
					{/each}
					<p>
						{book.description}
					</p>

					<div class="persons-container">
						{#each book.persons as person}
							<a href="/person/{person.person_id}">{person.name} - {person.role_type}</a>
						{/each}
					</div>
				</h4>
			</div>
		</div>
	{/each}
</main>

<style>
	.title-container {
		display: grid;
		grid-template-columns: 128px 1fr;
		gap: 0.5rem;
	}

	.persons-container {
		display: flex;
		gap: 0.5rem;
	}
</style>
