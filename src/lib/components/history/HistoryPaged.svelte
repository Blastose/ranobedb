<script lang="ts">
	import type { Change } from '$lib/server/db/change/change';
	import PaginationContainer from '../pagination/PaginationContainer.svelte';
	import History from './History.svelte';

	interface Props {
		changes: Change[];
		title: string;
		titleSize?: 'normal' | 'big';
		currentPage: number;
		totalPages: number;
		showItemTitle?: boolean;
		children?: import('svelte').Snippet;
	}

	let {
		changes,
		title,
		titleSize = 'normal',
		currentPage,
		totalPages,
		showItemTitle = false,
		children,
	}: Props = $props();
</script>

<div class="flex flex-col gap-4">
	<h1 class="font-bold {titleSize === 'big' ? 'text-4xl' : 'text-2xl'}">{title}</h1>

	{@render children?.()}

	<PaginationContainer {currentPage} {totalPages} showTopPages={true} results={undefined}>
		<History {changes} {showItemTitle}></History>
	</PaginationContainer>
</div>
