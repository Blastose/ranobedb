<script lang="ts">
	import Icon from '$lib/components/icon/Icon.svelte';
	import type { Language } from '$lib/server/db/dbTypes';
	import { langsWithoutRomaji, languageNames } from '$lib/db/dbConsts';
	import type { displayPrefsSchema } from '$lib/server/zod/schema';
	import { type SuperForm, arrayProxy, type Infer } from 'sveltekit-superforms';
	import Hr from '$lib/components/layout/Hr.svelte';
	import { flip } from 'svelte/animate';
	import { quintOut } from 'svelte/easing';

	interface Props {
		form: SuperForm<Infer<typeof displayPrefsSchema>, App.Superforms.Message>;
	}
	let { form }: Props = $props();

	// svelte-ignore state_referenced_locally
	const { values, errors, valueErrors } = arrayProxy(form, 'title_prefs');

	function handleRemoveLanguage(index: number) {
		$values.splice(index, 1);
		$values = $values;
	}

	function handleAddLangauge(e: Event & { currentTarget: EventTarget & HTMLSelectElement }) {
		if (e.currentTarget.value === 'none') return;

		$values.push({
			romaji: false,
			official: 'official',
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
	<div class="flex flex-col gap-1">
		{#each $values as title, index (title)}
			<div class="flex flex-col gap-1" animate:flip={{ duration: 500, easing: quintOut }}>
				<div class="grid grid-cols-2 gap-2">
					<div>
						<p>#{index + 1} {languageNames[title.lang]}</p>

						{#if !langsWithoutRomaji.includes(title.lang)}
							<label class="flex w-fit gap-1 text-sm"
								><input type="checkbox" bind:checked={title.romaji} /><span>Romaji</span></label
							>
						{/if}
					</div>
					<div class="flex items-center gap-2 justify-self-end">
						{#if title.lang !== 'ja'}
							<label class="flex gap-1 text-sm">
								<select class="input reset-padding w-fit" bind:value={title.official}>
									<option value="official">Official only</option>
									<option value="any">Any</option>
								</select>
							</label>
						{/if}
						<button
							class="btn rounded-full"
							disabled={index === 0}
							onclick={() => {
								swap($values, index, index - 1);
							}}
							type="button"
							aria-label="Move up"><Icon name="chevronUp" /></button
						>
						<button
							class="btn rounded-full"
							disabled={index === $values.length - 1}
							onclick={() => {
								swap($values, index, index + 1);
							}}
							type="button"
							aria-label="Move down"><Icon name="chevronDown" /></button
						>
						<button
							class="btn rounded-full"
							onclick={() => {
								handleRemoveLanguage(index);
							}}
							type="button"
							aria-label="Remove"><Icon name="close" /></button
						>
					</div>
				</div>
				{#if index !== $values.length - 1}<Hr />{:else}<div class="h-[1px]"></div>{/if}
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
		onchange={handleAddLangauge}
		class="input reset-padding mt-2 w-fit"
		name="add-titles"
		id="add-titles"
	>
		<option value="none">--Add language--</option>
		{#each Object.entries(languageNames) as [code, lang]}
			<option value={code}>{lang}</option>
		{/each}
	</select>
</section>
