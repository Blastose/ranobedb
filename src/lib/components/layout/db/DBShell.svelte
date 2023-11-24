<script lang="ts">
	import Pagination from '$lib/components/pagination/Pagination.svelte';
	import { page } from '$app/stores';
	import Icon from '$lib/components/icon/Icon.svelte';
	import Fly from '$lib/components/layout/Fly.svelte';
	import SearchInput from '$lib/components/form/SearchInput.svelte';
	import SubmitButton from '$lib/components/form/SubmitButton.svelte';

	export let name: string;
	export let currentPage: number;
	export let totalPages: number;
	export let results: number;
	export let inputPlaceholder: string;
</script>

<main class="container-rndb flex flex-col gap-4">
	<div class="db-filters">
		<h1 class="font-bold text-4xl">Browse {name}</h1>

		<form method="get">
			<div class="flex flex-col gap-2">
				<SearchInput {inputPlaceholder} ariaLabel={inputPlaceholder} />

				<div class="w-fit">
					<SubmitButton text="Search" delayed={false} submitting={false} />
				</div>
			</div>

			<slot name="form" />
		</form>

		<Pagination url={$page.url} {currentPage} {totalPages} />

		<p>{results} results</p>
	</div>

	<Fly key={$page.url.searchParams.toString()}>
		<slot name="display" />
	</Fly>

	<div class="pagination-bottom">
		<Pagination url={$page.url} {currentPage} {totalPages} />
	</div>
</main>

<style>
	.db-filters {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		view-transition-name: db-head-page;
	}

	.pagination-bottom {
		view-transition-name: db-head-page-bottom;
	}
</style>
