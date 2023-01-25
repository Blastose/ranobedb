<script lang="ts">
	import BookView from '$lib/components/book/BookView.svelte';
	import Icon from '$lib/components/icon/Icon.svelte';
	import Box from '$lib/components/box/Box.svelte';
	import type { PageData } from './$types';
	import { page } from '$app/stores';

	export let data: PageData;
</script>

<svelte:head>
	<title>{data.person.person_name} - RanobeDB</title>
</svelte:head>

<main class="person-container">
	<div class="highlight" />
	<div class="main-container content">
		<div class="banner">
			<div class="picture-container shadow-md">
				<div class="picture">
					<Icon height="" width="" name="profile" />
				</div>
			</div>

			<div class="name">
				<p class="text-3xl font-bold">{data.person.person_name}</p>
				<p class="text-xl font-semibold">{data.person.person_name_romaji ?? ''}</p>
			</div>
		</div>
		<div class="flex flex-col gap-4">
			<div>
				<p class="font-bold">Biography</p>
				<div class="markdown-text">
					{@html data.person.person_description || 'N/A'}
				</div>
			</div>
			<div class="w-min">
				<Box
					text={'Edit'}
					href={`/person/${$page.params.id}/edit`}
					icon={'pencil'}
					preload={false}
				/>
			</div>
		</div>
		<div><BookView books={data.books} /></div>
	</div>
</main>

<style>
	.person-container {
		display: grid;
		grid-template-areas:
			'highlight'
			'content';
		grid-template-rows: 10rem 1fr;
	}

	.highlight {
		background: linear-gradient(var(--primary-500), #2b2c3d);
	}

	.content {
		grid-area: content;
		padding: 0 2rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.banner {
		position: relative;
		margin-top: -8rem;
		display: grid;
		grid-template-areas:
			'picture name'
			'picture fill';
		grid-template-rows: 8rem 1fr;
		grid-template-columns: min-content 1fr;
		column-gap: 1.25rem;
	}

	.picture-container {
		grid-area: picture;
		background-color: var(--primary-500);
		color: white;
		height: 6rem;
		width: 6rem;
		border-radius: 9999px;
		align-self: flex-end;
		margin-bottom: 0.5rem;
		transition-duration: 150ms;
	}

	.picture {
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 1.5rem;
	}

	@media (min-width: 768px) {
		.picture-container {
			height: 10rem;
			width: 10rem;
			align-self: auto;
			margin-bottom: 0;
		}
	}

	.name {
		grid-area: name;
		color: white;
		margin-bottom: 1rem;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
	}
</style>
