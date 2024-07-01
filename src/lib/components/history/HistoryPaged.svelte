<script lang="ts">
	import type { Change } from '$lib/server/db/change/change';
	import PaginationContainer from '../pagination/PaginationContainer.svelte';
	import History from './History.svelte';

	export let changes: Change[];
	export let title: string;
	export let titleSize: 'normal' | 'big' = 'normal';
	export let currentPage: number;
	export let totalPages: number;
	export let showItemTitle: boolean = false;
</script>

<div class="flex flex-col gap-4">
	<h1 class="font-bold {titleSize === 'big' ? 'text-4xl' : 'text-2xl'}">{title}</h1>

	<slot />

	<PaginationContainer {currentPage} {totalPages} showTopPages={true} results={undefined}>
		<History {changes} {showItemTitle}></History>
	</PaginationContainer>
</div>
