<script lang="ts">
	import type { BookR } from '$lib/server/db/books/books';
	import type { Theme } from '$lib/stores/themeStore';
	import { themeStore } from '$lib/stores/themeStore';
	import type { User } from 'lucia';
	import BookModal from './BookModal.svelte';
	import type { userListBookSchema } from '$lib/zod/schema';
	import type { Infer, SuperValidated } from 'sveltekit-superforms';
	import Description from '$lib/components/book/Description.svelte';
	import { hasVisibilityPerms } from '$lib/db/permissions';

	export let book: BookR;
	export let theme: Theme;
	export let isRevision: boolean;
	export let user: User | null;
	export let userListForm: SuperValidated<Infer<typeof userListBookSchema>> | undefined = undefined;

	$: imageBgStyle = book.filename
		? ($themeStore ?? theme) === 'light'
			? `background-image: linear-gradient(rgba(242, 242, 242, 0.25) 0%, rgba(242, 242, 242, 1) 75%, rgba(242, 242, 242, 1) 100%), url(/covers_temp/${book.filename}.jpg);`
			: `background-image: linear-gradient(rgba(34, 34, 34, 0.7) 0%, rgba(34, 34, 34, 1) 90%, rgba(34, 34, 34, 1) 100%), url(/covers_temp/${book.filename}.jpg);`
		: '';
</script>

<main class="container-rndb -mt-32 flex flex-col gap-4">
	<div class="banner-img {isRevision ? 'h-[128px]' : 'h-[256px]'}" style={imageBgStyle}>
		<div class="blur-image" />
	</div>

	<div class="-mt-32 z-10 flex flex-col gap-4">
		<div class="grid grid-cols-1 sm:grid-cols-[200px_1fr] md:grid-cols-[256px_1fr] gap-6 sm:gap-12">
			<div class="flex flex-col items-center gap-4">
				{#if book.filename}
					<img
						width="240"
						height="360"
						class="img max-w-[200px] h-fit sm:max-w-[200px] rounded-sm shadow-sm"
						src="/covers_temp/{book.filename}.jpg"
						alt=""
					/>
				{:else}
					<div class="bg-neutral-500 w-[240px] h-[360px]">
						<p class="p-4">No cover</p>
					</div>
				{/if}

				{#if userListForm}
					{#if user}
						<BookModal {userListForm} {book} {imageBgStyle} />
					{:else}
						<a class="primary-btn w-full max-w-xs" href="/login">Add to reading list</a>
					{/if}
				{/if}
			</div>

			<div>
				<h1 class="font-bold text-3xl sm:text-4xl">{book.title}</h1>
				<p class="opacity-60">{book.romaji_orig ?? ''}</p>

				<section class="pt-4">
					<h2 class="font-bold text-lg">Description</h2>
					{#if book.description_ja}
						<Description description={book.description_ja} />
					{/if}
				</section>
			</div>
		</div>

		{#if user && hasVisibilityPerms(user)}
			<section>
				<h2 class="font-bold text-lg">Visibility</h2>
				<p>Hidden: {book.hidden}</p>
				<p>Locked: {book.locked}</p>
			</section>
		{/if}
		{#if book.locked}
			<p>This book is locked from editing</p>
		{/if}

		<section class="mt-4">
			<h2 class="font-bold text-lg">Titles</h2>
			<div>
				{#each book.titles as title}
					<p>{title.lang} - {title.title}</p>
				{/each}
			</div>
		</section>

		<section>
			<h2 class="font-bold text-lg">Staff</h2>
			<div class="flex flex-wrap gap-4">
				{#each book.staff as staff}
					<p>
						<a href="/staff/{staff.staff_id}"
							>{staff.name} <span class="opacity-70">{staff.role_type}</span></a
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

		{#if !isRevision}
			<section>
				<a class="block font-bold text-lg" href="/book/{book.id}/edit">Edit book</a>
				<a class="block font-bold text-lg" href="/book/{book.id}/history">History</a>
			</section>
		{/if}
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
