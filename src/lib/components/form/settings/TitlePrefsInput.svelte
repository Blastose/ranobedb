<script lang="ts">
	import Icon from '$lib/components/icon/Icon.svelte';
	import type { Language } from '$lib/server/db/dbTypes';
	import { langsWithoutRomaji, languageNames } from '$lib/db/dbConsts';
	import type { displayPrefsSchema } from '$lib/server/zod/schema';
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

<section>
	<h3 class="text-lg font-bold">Titles</h3>
	<p class="text-sm">
		The title will fallback to the book's title in its original language if it doesn't have any of
		the titles listed
	</p>
	<div>
		{#each $values as title, index}
			<div class="grid grid-cols-2 gap-2">
				<div>
					<p>#{index + 1} {languageNames[title.lang]}</p>
					{#if !langsWithoutRomaji.includes(title.lang)}
						<label class="flex gap-1 text-sm"
							><input type="checkbox" bind:checked={title.romaji} /><span>Romaji</span></label
						>
					{/if}
				</div>
				<div>
					<button
						class="btn rounded-full"
						disabled={index === 0}
						on:click={() => {
							swap($values, index, index - 1);
						}}
						type="button"
						aria-label="Move up"><Icon name="chevronUp" /></button
					>
					<button
						class="btn rounded-full"
						disabled={index === $values.length - 1}
						on:click={() => {
							swap($values, index, index + 1);
						}}
						type="button"
						aria-label="Move down"><Icon name="chevronDown" /></button
					>
					<button
						class="btn rounded-full"
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
		<p>
			<span class="error-text-color">{$errors}</span>
		</p>
	{/if}
	<select
		aria-label="add title"
		on:change={handleAddLangauge}
		class="input w-fit reset-padding mt-2"
		name="add-titles"
		id="add-titles"
	>
		<option value="none">--Add language--</option>
		{#each Object.entries(languageNames) as [code, lang]}
			<option value={code}>{lang}</option>
		{/each}
	</select>
</section>
