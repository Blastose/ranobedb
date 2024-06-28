<script lang="ts">
	import SearchInput from '$lib/components/form/SearchInput.svelte';
	import SubmitButton from '$lib/components/form/SubmitButton.svelte';
	import PaginationContainer from '$lib/components/pagination/PaginationContainer.svelte';

	export let name: string;
	export let currentPage: number;
	export let totalPages: number;
	export let results: number;
	export let inputPlaceholder: string;
	export let customName: boolean = false;

	$: heading = customName ? name : `Browse ${name}`;
</script>

<main class="container-rndb flex flex-col gap-4">
	<div class="db-filters">
		<h1 class="font-bold text-4xl">{heading}</h1>

		<form method="get">
			<div class="flex flex-col gap-2">
				<SearchInput {inputPlaceholder} ariaLabel={inputPlaceholder} />

				<slot name="filters" />

				<div class="w-fit">
					<SubmitButton text="Search" delayed={false} submitting={false} />
				</div>
			</div>

			<slot name="form" />
		</form>

		<slot name="info" />
	</div>

	<PaginationContainer {results} {currentPage} {totalPages} showTopPages={true}>
		<slot name="display" />
	</PaginationContainer>
</main>

<style>
	.db-filters {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		view-transition-name: db-head-page;
	}
</style>
