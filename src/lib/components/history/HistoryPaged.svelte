<script lang="ts">
	import type { Change } from '$lib/server/db/change/change';
	import PaginationContainer from '../pagination/PaginationContainer.svelte';
	import History from './History.svelte';

	export let changes: Change[];
	export let title: string;
	export let currentPage: number;
	export let totalPages: number;
	export let showItemTitle: boolean = false;
</script>

<div class="flex flex-col gap-2">
	<h1 class="font-semibold text-2xl">{title}</h1>
	<PaginationContainer {currentPage} {totalPages} showTopPages={true} results={undefined}>
		<History {changes} {showItemTitle} />
	</PaginationContainer>
</div>
