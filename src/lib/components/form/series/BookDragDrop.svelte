<script lang="ts">
	import { flip } from 'svelte/animate';
	import Icon from '$lib/components/icon/Icon.svelte';
	import { quintOut } from 'svelte/easing';
	import DndItem from './DndItem.svelte';

	export let items: {
		id: number;
		sort_order: number;
		title?: string | null | undefined;
		romaji?: string | null | undefined;
	}[];

	export let remove: (index: number) => void;
	export let updateSortOrder: () => void;

	function swap<T>(arr: T[], indexL: number, indexR: number) {
		if (indexL < 0 || indexR < 0) return;
		if (indexL > arr.length - 1 || indexR > arr.length - 1) return;

		[arr[indexR], arr[indexL]] = [arr[indexL], arr[indexR]];
		updateSortOrder();
		items = items;
	}

	let dragging = false;
	let currentDragIndex = 0;
	let currentHoverIndex = 0;
	let currentHover: HTMLElement;

	function dragList(node: HTMLDivElement) {
		function reorderItem() {
			let newIndex = currentHoverIndex;
			if (currentHoverIndex > currentDragIndex) {
				newIndex = newIndex - 1;
			}

			const movedItem = items.splice(currentDragIndex, 1);
			items.splice(newIndex, 0, movedItem[0]);
			updateSortOrder();
			items = items;
		}

		node.addEventListener('dragend', reorderItem);

		return {
			destroy: () => {
				node.removeEventListener('dragend', reorderItem);
			},
		};
	}
</script>

<div use:dragList class="flex flex-col gap-2">
	{#each items as item, index (item.id)}
		<div animate:flip={{ duration: 500, easing: quintOut }}>
			<DndItem
				arrayIndex={index}
				bind:currentHover
				bind:currentDragIndex
				bind:currentHoverIndex
				bind:dragging
			>
				<div
					class="h-[1px] w-full rounded-full duration-75"
					class:divider={dragging && currentHoverIndex === index}
				/>
				<div class="rounded-md grid grid-cols-[min-content_1fr_min-content] gap-2">
					<div class="flex cursor-grab" aria-label="drag">
						<span class="whitespace-nowrap">#{index + 1}</span>
						<Icon name="drag" />
					</div>
					<a target="_blank" rel="noreferrer" href="/book/{item.id}" class="link line-clamp-1"
						><span class="text-sm">#{item.id}:</span> {item.title}</a
					>
					<div class="flex gap-2">
						<button
							on:click={() => {
								swap(items, index, index - 1);
							}}
							type="button"
							aria-label="Move up"><Icon name="chevronUp" /></button
						>
						<button
							on:click={() => {
								swap(items, index, index + 1);
							}}
							type="button"
							aria-label="Move down"><Icon name="chevronDown" /></button
						>

						<button
							on:click={() => {
								remove(index);
							}}
							type="button"
							aria-label="Remove"><Icon name="close" /></button
						>
					</div>
				</div>
			</DndItem>
		</div>
	{/each}
	<div
		class="h-[1px] w-full rounded-full duration-75"
		class:divider={dragging && currentHoverIndex === items.length}
	/>
</div>

<style>
	.divider {
		background-color: var(--primary-500);
	}
</style>
