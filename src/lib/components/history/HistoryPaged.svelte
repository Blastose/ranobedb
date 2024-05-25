<script lang="ts">
	import type { Change } from '$lib/server/db/change/change';
	import type { DbItem } from '$lib/server/db/dbTypes';
	import PaginationContainer from '../pagination/PaginationContainer.svelte';
	import History from './History.svelte';

	export let changes: Change[];
	export let title: string;
	export let prefix: string;
	export let dbItem: DbItem;
	export let currentPage: number;
	export let totalPages: number;
</script>

<div class="flex flex-col gap-2">
	<h1 class="font-semibold text-2xl">{title}</h1>
	<PaginationContainer {currentPage} {totalPages} showTopPages={true} results={undefined}>
		<History {changes} {dbItem} {prefix} />
	</PaginationContainer>
</div>
