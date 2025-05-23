<script lang="ts">
	import SearchInput from '$lib/components/form/SearchInput.svelte';
	import SubmitButton from '$lib/components/form/SubmitButton.svelte';
	import PaginationContainer from '$lib/components/pagination/PaginationContainer.svelte';

	interface Props {
		name: string;
		currentPage: number;
		totalPages: number;
		results: string;
		inputPlaceholder: string;
		customName?: boolean;
		underHeading?: import('svelte').Snippet;
		filters?: import('svelte').Snippet;
		form?: import('svelte').Snippet;
		info?: import('svelte').Snippet;
		display?: import('svelte').Snippet;
	}

	let {
		name,
		currentPage,
		totalPages,
		results,
		inputPlaceholder,
		customName = false,
		underHeading,
		filters,
		form,
		info,
		display,
	}: Props = $props();

	let heading = $derived(customName ? name : `Browse ${name}`);
</script>

<main class="container-rndb flex flex-col gap-4">
	<div class="db-filters">
		<h1 class="font-bold text-4xl">{heading}</h1>

		{@render underHeading?.()}

		<form method="get">
			<div class="flex flex-col gap-2">
				<SearchInput {inputPlaceholder} ariaLabel={inputPlaceholder} />

				{@render filters?.()}

				<div class="w-fit">
					<SubmitButton text="Search" delayed={false} submitting={false} />
				</div>
			</div>

			{@render form?.()}
		</form>

		{@render info?.()}
	</div>

	<PaginationContainer {results} {currentPage} {totalPages} showTopPages={true}>
		{@render display?.()}
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
