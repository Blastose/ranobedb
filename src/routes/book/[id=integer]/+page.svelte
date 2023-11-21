<script lang="ts">
	import { themeStore } from '$lib/stores/themeStore.js';

	export let data;

	$: book = data.book;

	$: theme =
		($themeStore ?? data.theme) === 'light'
			? `background-image: linear-gradient(rgba(242, 242, 242, 0.2) 0%, rgba(242, 242, 242, 1) 90%, rgba(242, 242, 242, 1) 100%), url(/covers_temp/${book.filename}.jpg);`
			: `background-image: linear-gradient(rgba(34, 34, 34, 0.7) 0%, rgba(34, 34, 34, 1) 90%, rgba(34, 34, 34, 1) 100%),  url(/covers_temp/${book.filename}.jpg);`;
</script>

<main class="container-rndb -mt-16 flex flex-col gap-4">
	<div class="banner-img h-[256px] bg-no-repeat bg-cover" style={theme}>
		<div class="blur-image" />
	</div>

	<div class="-mt-32 z-10 flex flex-col gap-4">
		<div class="flex gap-4">
			<img
				width="240"
				height="360"
				class="img max-w-[100px] h-fit sm:max-w-[200px] rounded-sm shadow-sm"
				src="/covers_temp/{book.filename}.jpg"
				alt=""
			/>

			<div>
				<h1 class="font-bold text-4xl">{book.title}</h1>
				<p>{book.romaji_orig}</p>
			</div>
		</div>

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
	</div>
</main>

<style>
	.banner-img {
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
	}
</style>
