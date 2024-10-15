<script lang="ts">
	import Pagination from './Pagination.svelte';
	import { page } from '$app/stores';
	import Fly from '../layout/Fly.svelte';

	export let currentPage: number;
	export let totalPages: number;
	export let showTopPages: boolean = true;
	export let results: string | undefined;
	export let hideTotalPages: boolean = totalPages > 5000;
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
			<slot />
		{:else}
			<p class="text-center sub-text">There are no results</p>
		{/if}
	</Fly>

	<Pagination url={$page.url} {currentPage} {totalPages} {hideTotalPages} />
</div>
