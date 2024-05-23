<script lang="ts">
	import Icon from '$lib/components/icon/Icon.svelte';
	import { languageNames, type Language } from '$lib/db/dbTypes';
	import type { displayPrefsSchema } from '$lib/zod/schema';
	import { flip } from 'svelte/animate';
	import { type SuperForm, arrayProxy, type Infer } from 'sveltekit-superforms';

	export let form: SuperForm<Infer<typeof displayPrefsSchema>, App.Superforms.Message>;

	const { values, errors, valueErrors } = arrayProxy(form, 'title_prefs');

	function handleRemoveLanguage(index: number) {
		$values.splice(index, 1);
		$values = $values;
	}

	function handleAddLangauge(e: Event & { currentTarget: EventTarget & HTMLSelectElement }) {
		if (e.currentTarget.value === 'none') return;

		$values.push({
			romaji: true,
			lang: e.currentTarget.value as Language,
		});
		$values = $values;
		e.currentTarget.selectedIndex = 0;
	}

	function swap<T>(arr: T[], indexL: number, indexR: number) {
		if (indexL < 0 || indexR < 0) return;
		if (indexL > arr.length - 1 || indexR > arr.length - 1) return;

		[arr[indexR], arr[indexL]] = [arr[indexL], arr[indexR]];
		$values = $values;
	}
</script>

<section class="flex flex-col gap-2">
	<h3 class="text-lg font-bold">Titles</h3>
	<div>
		{#each $values as title, index}
			<div class="grid grid-cols-2 gap-2">
				<div>
					<p>#{index + 1} {languageNames[title.lang]}</p>
					<label class="flex gap-1 text-sm"
						><input type="checkbox" bind:checked={title.romaji} /><span>Romaji</span></label
					>
				</div>
				<div>
					<button
						on:click={() => {
							swap($values, index, index - 1);
						}}
						type="button"
						aria-label="Move up"><Icon name="chevronUp" /></button
					>
					<button
						on:click={() => {
							swap($values, index, index + 1);
						}}
						type="button"
						aria-label="Move down"><Icon name="chevronDown" /></button
					>
					<button
						on:click={() => {
							handleRemoveLanguage(index);
						}}
						type="button"
						aria-label="Remove"><Icon name="close" /></button
					>
				</div>
			</div>
		{/each}
	</div>
	{#if $errors}
		<span class="error-text-color">{$errors}</span>
	{/if}
	<select
		aria-label="add title"
		on:change={handleAddLangauge}
		class="input w-fit reset-padding"
		name="add-titles"
		id="add-titles"
	>
		<option value="none">--Add language--</option>
		{#each Object.entries(languageNames) as [code, lang]}
			<option value={code}>{lang}</option>
		{/each}
	</select>
</section>
