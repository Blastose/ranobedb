<script lang="ts">
	import type { BookR } from '$lib/server/db/books/books';
	import { getBgImageStyle, getThemeContext } from '$lib/stores/themeStore';
	import type { User } from 'lucia';
	import BookModal from './BookModal.svelte';
	import type { userListBookSchema } from '$lib/server/zod/schema';
	import type { Infer, SuperValidated } from 'sveltekit-superforms';
	import Description from '$lib/components/book/Description.svelte';
	import VisibilityDisplay from '$lib/components/layout/db/VisibilityDisplay.svelte';
	import VisibilityDisplayPerm from '$lib/components/layout/db/VisibilityDisplayPerm.svelte';
	import { PUBLIC_IMAGE_URL } from '$env/static/public';
	import BookImage from '../BookImage.svelte';
	import BookCarousel from '../BookCarousel.svelte';
	import { buildRedirectUrl } from '$lib/utils/url';
	import { page } from '$app/stores';
	import { getDisplayPrefsContext } from '$lib/display/prefs';
	import TitleDisplay from '$lib/components/display/TitleDisplay.svelte';
	import PublishersSection from '$lib/components/publisher/PublishersSection.svelte';
	import BookReleases from './BookReleases.svelte';
	import StaffsSectionSnippet from '$lib/components/staff/StaffsSectionSnippet.svelte';

	export let book: BookR;
	export let isRevision: boolean;
	export let user: User | null;
	export let userListForm: SuperValidated<Infer<typeof userListBookSchema>> | undefined = undefined;

	const theme = getThemeContext();
	$: imageUrl = book.image?.filename ? `${PUBLIC_IMAGE_URL}${book.image?.filename}` : null;
	$: bgImageStyle = getBgImageStyle($theme, imageUrl);
	const displayPrefs = getDisplayPrefsContext();
</script>

<main class="container-rndb -mt-32 flex flex-col gap-4">
	<div class="banner-img {isRevision ? 'h-[128px]' : 'h-[256px]'}" style={bgImageStyle}>
		<div class="blur-image" />
	</div>

	<div class="-mt-32 z-10 flex flex-col gap-4">
		<div class="grid grid-cols-1 sm:grid-cols-[200px_1fr] md:grid-cols-[256px_1fr] gap-6 sm:gap-12">
			<div class="flex flex-col items-center gap-4">
				{#if book.image}
					<img
						width={book.image.width}
						height={book.image.height}
						class="max-w-[200px] h-fit sm:max-w-[200px] rounded-md shadow-sm"
						src={imageUrl}
						alt=""
						loading="lazy"
					/>
				{:else}
					<div class="bg-neutral-500 w-[240px] h-[320px] rounded-md">
						<p class="p-4">No cover</p>
					</div>
				{/if}

				{#if userListForm}
					{#if user}
						<!-- This div is needed to prevent the flex from above because the BookModal component has a portal -->
						<!-- so it will generate an empty gap space before hydration -->
						<div class="w-full">
							<BookModal {userListForm} {book} />
						</div>
					{:else}
						<a class="primary-btn w-full max-w-xs" href={buildRedirectUrl($page.url, '/login')}
							>Add to reading list</a
						>
					{/if}
				{/if}
			</div>

			<div>
				<h1 class="font-bold text-3xl sm:text-4xl">
					<TitleDisplay obj={book} />
				</h1>
				<p class="sub-text"><TitleDisplay obj={book} type="sub" /></p>

				{#if !isRevision}
					<section class="pt-4">
						<VisibilityDisplay
							item={book}
							type="book"
							{user}
							copyTo={{ to: ['release', 'series'], langs: book.titles.map((t) => t.lang) }}
						/>
					</section>
				{/if}

				<section class="mt-2">
					<VisibilityDisplayPerm item={book} {user} />
				</section>

				<section class="pt-4">
					<h2 class="font-bold text-lg">Description</h2>
					{#if $displayPrefs.descriptions === 'en'}
						<Description description={(book.description || book.description_ja) ?? ''} />
					{:else if $displayPrefs.descriptions === 'ja'}
						<Description description={book.description_ja || book.description} />
					{/if}
				</section>
			</div>
		</div>

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
				{#each book.editions as edition}
					<div class="flex flex-col gap-2">
						<p class="font-semibold">
							{edition.title}
							{#if edition.lang}- {edition.lang}{/if}
						</p>
						<StaffsSectionSnippet staffs={edition.staff} />
					</div>
				{/each}
			</div>
		</section>

		<PublishersSection publishers={book.publishers} />

		<BookReleases releases={book.releases} />

		<section>
			<h2 class="font-bold text-lg">Series</h2>
			<div class="flex flex-col gap-2">
				{#each book.series as series}
					<BookCarousel>
						<svelte:fragment slot="link">
							<a class="link w-fit font-bold" href="/series/{series.id}"
								><TitleDisplay obj={series} /></a
							>
						</svelte:fragment>
						<svelte:fragment slot="items">
							{#each series.books as other_book (other_book.id)}
								<div class="carousel-item">
									<BookImage book={other_book} urlPrefix="/book/" />
								</div>
							{/each}
						</svelte:fragment>
					</BookCarousel>
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
		backdrop-filter: blur(8px);
	}
</style>
