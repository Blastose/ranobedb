<script lang="ts">
	import Pagination from '$lib/components/pagination/Pagination.svelte';
	import { page } from '$app/stores';
	import Icon from '$lib/components/icon/Icon.svelte';

	export let name: string;
	export let currentPage: number;
	export let totalPages: number;
	export let results: number;
</script>

<main class="container-rndb flex flex-col gap-4">
	<div class="asdf">
		<h1 class="font-bold text-4xl">Browse {name}</h1>

		<form method="get">
			<div class="flex flex-col gap-2">
				<div class="relative">
					<input
						name="q"
						type="text"
						class="input w-full max-w-xl"
						style="padding-left: 2.5rem !important;"
						placeholder="Search by book title"
					/>
					<Icon class="absolute top-2 left-2" name="search" />
				</div>

				<button
					type="submit"
					class="text-white flex gap-2 items-center w-fit rounded-md px-4 py-2 bg-[var(--primary-500)]"
					><Icon name="search" />Search</button
				>
			</div>

			<slot name="form" />
		</form>

		<Pagination url={$page.url} {currentPage} {totalPages} />

		<p>{results} results</p>
	</div>

	<slot name="display" />

	<div class="asdf2">
		<Pagination url={$page.url} {currentPage} {totalPages} />
	</div>
</main>

<style>
	.asdf {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		view-transition-name: db-head-page;
	}

	.asdf2 {
		view-transition-name: db-head-page-bottom;
	}
</style>
