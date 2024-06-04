<script lang="ts">
	import { flip } from 'svelte/animate';
	import Icon from '$lib/components/icon/Icon.svelte';
	import { quintOut } from 'svelte/easing';
	import DndItem from './DndItem.svelte';
	import TitleDisplay from '$lib/components/display/TitleDisplay.svelte';
	import type { seriesSchema } from '$lib/server/zod/schema';
	import { tick } from 'svelte';
	import { seriesBookTypeArray } from '$lib/db/dbConsts';
	import { arrayProxy, type Infer, type SuperForm } from 'sveltekit-superforms';

	export let form: SuperForm<Infer<typeof seriesSchema>, App.Superforms.Message>;

	const { values, errors, valueErrors } = arrayProxy(form, 'books');

	export let remove: (index: number) => void;
	export let updateSortOrder: () => void;

	async function swap<T>(arr: T[], indexL: number, indexR: number, direction: 'up' | 'down') {
		if (indexL < 0 || indexR < 0) return;
		if (indexL > arr.length - 1 || indexR > arr.length - 1) return;

		[arr[indexR], arr[indexL]] = [arr[indexL], arr[indexR]];
		updateSortOrder();
		$values = $values;

		// When the up button is pressed and swaped, the button afterwards is not focused, whereas it is when the down button is pressed,
		// so we need to manually focus the button
		if (direction === 'up') {
			await tick();
			const button = bookList.querySelector<HTMLButtonElement>(
				`button[data-index="${indexL - 1}"]`,
			);
			if (button) {
				button.focus();
			}
		}
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

			const movedItem = $values.splice(currentDragIndex, 1);
			$values.splice(newIndex, 0, movedItem[0]);
			updateSortOrder();
			$values = $values;
		}

		node.addEventListener('dragend', reorderItem);

		return {
			destroy: () => {
				node.removeEventListener('dragend', reorderItem);
			},
		};
	}
	let bookList: HTMLDivElement;
</script>

<div use:dragList class="flex flex-col gap-2" bind:this={bookList}>
	{#each $values as item, index (item.id)}
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
						><span class="text-sm">#{item.id}:</span>
						<TitleDisplay
							obj={{
								lang: item.lang ?? 'en',
								romaji: item.romaji ?? '',
								romaji_orig: null,
								title: item.title ?? '',
								title_orig: '',
							}}
						/></a
					>
					<div class="flex gap-2">
						<button
							class="btn rounded-full"
							disabled={index === 0}
							on:click={() => {
								swap($values, index, index - 1, 'up');
							}}
							type="button"
							data-index={index}
							aria-label="Move up"><Icon name="chevronUp" /></button
						>
						<button
							class="btn rounded-full"
							disabled={index === $values.length - 1}
							on:click={() => {
								swap($values, index, index + 1, 'down');
							}}
							type="button"
							aria-label="Move down"><Icon name="chevronDown" /></button
						>

						<button
							class="btn rounded-full"
							on:click={() => {
								remove(index);
								updateSortOrder();
							}}
							type="button"
							aria-label="Remove"><Icon name="close" /></button
						>
					</div>
				</div>
			</DndItem>
			<label class="flex gap-2">
				<span>Book type:</span>
				<select class="input reset-padding" bind:value={$values[index].book_type}>
					{#each seriesBookTypeArray as role}
						<option value={role} selected={role === $values[index].book_type}>{role}</option>
					{/each}
				</select>
			</label>
		</div>
	{/each}
	<div
		class="h-[1px] w-full rounded-full duration-75"
		class:divider={dragging && currentHoverIndex === $values.length}
	/>
	{#if $errors}
		<p class="error-text-color">{$errors}</p>
	{/if}
</div>

<style>
	.divider {
		background-color: var(--primary-500);
	}
</style>
