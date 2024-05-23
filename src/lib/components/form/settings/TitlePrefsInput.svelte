<script lang="ts">
	import { languageNames, type Language } from '$lib/db/dbTypes';
	import type { displayPrefsSchema } from '$lib/zod/schema';
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
</script>

<section class="flex flex-col gap-2">
	<h3 class="text-lg font-bold">Titles</h3>
	{#each $values as title, i}
		<div class="flex gap-2">
			<p>#{i + 1} {languageNames[title.lang]}</p>
			<input type="checkbox" name="" id="" />
			<button type="button">Up</button>
			<button type="button">Down</button>
			<button
				on:click={() => {
					handleRemoveLanguage(i);
				}}
				type="button">Delete</button
			>
		</div>
	{/each}
	<select
		aria-label="add title"
		on:change={handleAddLangauge}
		class="input w-fit"
		name="add-titles"
		id="add-titles"
	>
		<option value="none">--Add language--</option>
		{#each Object.entries(languageNames) as [code, lang]}
			<option value={code}>{lang}</option>
		{/each}
	</select>
</section>
