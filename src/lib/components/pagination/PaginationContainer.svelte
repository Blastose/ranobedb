<script lang="ts">
	import Pagination from './Pagination.svelte';
	import { page } from '$app/stores';
	import Fly from '../layout/Fly.svelte';

	interface Props {
		currentPage: number;
		totalPages: number;
		showTopPages?: boolean;
		results: string | undefined;
		hideTotalPages?: boolean;
		children?: import('svelte').Snippet;
	}

	let {
		currentPage,
		totalPages,
		showTopPages = true,
		results,
		hideTotalPages = totalPages > 5000,
		children,
	}: Props = $props();
</script>

<div class="flex flex-col gap-4">
	{#if showTopPages && results !== undefined}
		<div class="flex flex-col gap-2">
			<Pagination url={$page.url} {currentPage} {totalPages} {hideTotalPages} />
			<p>{results} results</p>
		</div>
	{:else}
		{#if showTopPages}
			<Pagination url={$page.url} {currentPage} {totalPages} {hideTotalPages} />
		{/if}

		{#if results !== undefined}
			<p>{results} results</p>
		{/if}
	{/if}

	<Fly key={$page.url.searchParams.toString()}>
		{#if results !== '0' && currentPage <= totalPages}
			{@render children?.()}
		{:else}
			<p class="text-center sub-text">There are no results</p>
		{/if}
	</Fly>

	<Pagination url={$page.url} {currentPage} {totalPages} {hideTotalPages} />
</div>
