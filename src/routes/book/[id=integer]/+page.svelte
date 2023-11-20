<script lang="ts">
	export let data;

	$: book = data.book;
</script>

<main class="container-rndb flex flex-col gap-4">
	<div
		class="banner-img h-[20px] bg-no-repeat bg-cover"
		style="background-image:linear-gradient(rgba(27, 27, 27, 0.1), rgba(33, 34, 36, 0.9)),  url(/covers_temp/{book.filename}.jpg);"
	>
		<div class="blur-image" />
	</div>
	<div>
		<h1 class="font-bold text-2xl">{book.title}</h1>
		<p class="text-sm">{book.romaji_orig}</p>
	</div>

	<img
		width="240"
		height="360"
		class="img max-w-[200px] rounded-sm shadow-sm"
		src="/covers_temp/{book.filename}.jpg"
		alt=""
	/>

	<section>
		<h2 class="font-bold text-lg">Description</h2>
		<p class="whitespace-pre-wrap max-w-3xl">
			{book.description_jp}
		</p>
	</section>

	<section>
		<h2 class="font-bold text-lg">Staff</h2>
		<div>
			{#each book.persons as person}
				<p>{person.name} <span class="opacity-70">{person.role_type}</span></p>
			{/each}
		</div>
	</section>
</main>

<style>
	.banner-img {
		min-height: 8rem;
		overflow: hidden;
		background-repeat: no-repeat;
		background-size: cover;
		background-position: 20% 20%;
		margin-left: calc(-50vw + 50%);
		margin-right: calc(-50vw + 50%);
	}

	.blur-image {
		height: 100%;
		width: 100%;
		backdrop-filter: blur(10px);
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		color: white;
	}
</style>
