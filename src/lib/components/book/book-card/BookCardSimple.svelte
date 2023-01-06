<script lang="ts">
	import type { BookInfo } from '$lib/types/dbTypes';
	import { PUBLIC_IMAGE_URL } from '$env/static/public';
	import Icon from '$lib/components/icon/Icon.svelte';

	export let book: BookInfo;
</script>

<div class="card-container">
	<a class="h-min" href="/book/{book.id}">
		<img
			loading="lazy"
			class="shadow-sm rounded-sm overflow-hidden"
			src="{PUBLIC_IMAGE_URL}/{book.cover_image_file_name}.jpg"
			width="64px"
			height="91px"
			alt={book.title}
		/>
	</a>
	<div class="flex flex-col gap-2">
		<a href="/book/{book.id}">
			<p class="title font-bold text-xl">{book.title}</p>
		</a>
		<div class="detail text-sm md:text-base">
			<div class="title col-span-2">
				<p class="grid grid-cols-[min-content_1fr] items-center gap-1">
					<Icon height="20" width="20" name="people" />
					<span class="flex gap-2">
						{#each book.authors as author (author.id)}
							<a class="title" href="/person/{author.id}">{author.name}</a>
						{/each}
						{#each book.artists as artist (artist.id)}
							<a class="title" href="/person/{artist.id}">{artist.name}</a>
						{/each}
					</span>
				</p>
			</div>
			<div class="icon-text">
				<Icon height="20" width="20" name="bookOpenPage" />
				<p>
					{book.volume}
				</p>
			</div>
			<div class="icon-text justify-end">
				<Icon height="20" width="20" name="calendarRange" />
				<p>
					{book.release_date}
				</p>
			</div>
		</div>
	</div>
</div>

<style>
	.card-container {
		background-color: var(--primary-100);
		padding: 0.5rem;
		display: grid;
		grid-template-columns: 64px 1fr;
		grid-template-rows: 91px;
		column-gap: 0.5rem;
	}

	:global(.dark) .card-container {
		background-color: var(--dark-500);
	}

	.detail {
		flex-grow: 1;
		display: grid;
		row-gap: 0.125rem;
		grid-template-columns: min-content 1fr;
		justify-content: space-between;
		align-content: space-between;
	}

	.icon-text {
		display: flex;
		gap: 0.25rem;
		place-items: center;
	}

	.title {
		overflow: hidden;
		display: -webkit-box;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical;
	}
</style>
