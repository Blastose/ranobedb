<script lang="ts">
	import type { BookR } from '$lib/server/db/books/books';
	import type { Theme } from '$lib/stores/themeStore';
	import { themeStore } from '$lib/stores/themeStore';
	import type { User } from 'lucia';
	import BookModal from './BookModal.svelte';
	import type { userListBookSchema } from '$lib/zod/schema';
	import type { SuperValidated } from 'sveltekit-superforms';

	export let book: BookR;
	export let theme: Theme;
	export let user: User | undefined;
	export let userListForm: SuperValidated<typeof userListBookSchema>;

	$: imageBgStyle =
		($themeStore ?? theme) === 'light'
			? `background-image: linear-gradient(rgba(242, 242, 242, 0.25) 0%, rgba(242, 242, 242, 1) 75%, rgba(242, 242, 242, 1) 100%), url(/covers_temp/${book.filename}.jpg);`
			: `background-image: linear-gradient(rgba(34, 34, 34, 0.7) 0%, rgba(34, 34, 34, 1) 90%, rgba(34, 34, 34, 1) 100%), url(/covers_temp/${book.filename}.jpg);`;
</script>

<main class="container-rndb -mt-32 flex flex-col gap-4">
	<div class="banner-img h-[256px]" style={imageBgStyle}>
		<div class="blur-image" />
	</div>

	<div class="-mt-32 z-10 flex flex-col gap-4">
		<div class="flex gap-4">
			<div class="flex flex-col gap-2">
				<img
					width="240"
					height="360"
					class="img max-w-[128px] h-fit sm:max-w-[200px] rounded-sm shadow-sm"
					src="/covers_temp/{book.filename}.jpg"
					alt=""
				/>

				{#if user}
					<BookModal {userListForm} {book} {imageBgStyle} />
				{:else}
					<button>Log in</button>
				{/if}
			</div>

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
					<p>
						<a href="/person/{person.person_id}"
							>{person.name} <span class="opacity-70">{person.role_type}</span></a
						>
					</p>
				{/each}
			</div>
		</section>

		<section>
			<h2 class="font-bold text-lg">Releases</h2>
			<div>
				{#each book.releases as release}
					<p>
						<a href="/release/{release.id}"
							>{release.title} - {release.lang} - {release.release_date}</a
						>
					</p>
				{/each}
			</div>
		</section>

		<section>
			<h2 class="font-bold text-lg">Series</h2>
			<div>
				{#each book.series as series}
					<p>
						<a href="/series/{series.id}">{series.id}</a>
					</p>
				{/each}
			</div>
		</section>

		<section>
			<h2 class="font-bold text-lg">Reviews</h2>
		</section>

		<section>
			<h2 class="font-bold text-lg">User stats</h2>
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
		backdrop-filter: blur(8px);
	}
</style>
