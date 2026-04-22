<script lang="ts" generics="T extends Record<string, unknown>, F extends FormPathArrays<T>">
	import { langsWithoutRomaji, languageNames, languagesArray } from '$lib/db/dbConsts';
	import type { Language } from '$lib/server/db/dbTypes';
	import {
		type SuperForm,
		arrayProxy,
		type FormPathArrays,
		type FormPathType,
		type ArrayProxy,
	} from 'sveltekit-superforms';

	type Title = {
		lang: Language;
		official: true;
		title: string;
		romaji?: string | null;
	};

	export let form: SuperForm<T, App.Superforms.Message>;
	export let field: FormPathType<T, F> extends Title[] ? F : never;
	export let label: string | null = null;

	const { values, errors, valueErrors } = arrayProxy(form, field) as unknown as ArrayProxy<Title>;

	function handleRemoveTitle(index: number) {
		$values.splice(index, 1);
		$values = $values;
	}

	function handleAddTitle(e: Event & { currentTarget: EventTarget & HTMLSelectElement }) {
		if (e.currentTarget.value === 'none') return;

		$values.push({
			lang: e.currentTarget.value as Language,
			official: true,
			title: '',
			romaji: '',
		});
		$values = $values;
		e.currentTarget.selectedIndex = 0;
	}
</script>

<section class="flex flex-col gap-2">
	<h2 class="font-bold text-lg">{label ?? 'Titles'}</h2>
	{#each $values as title, i}
		<div class="flex flex-col gap-2">
			<label class="flex flex-col gap-2"
				>{languageNames[title.lang]}
				<input
					placeholder="Title in {languageNames[title.lang]}"
					class="input w-full"
					class:error={$valueErrors[i]?.title}
					aria-invalid={$valueErrors[i]?.title ? 'true' : undefined}
					type="text"
					bind:value={$values[i].title}
				/>
			</label>
			{#if $valueErrors[i]?.title}
				<span class="error-text-color">{$valueErrors[i]?.title}</span>
			{/if}
			{#if !langsWithoutRomaji.includes(title.lang)}
				<input
					placeholder="Romanization (leave empty if the title is already in romaji)"
					class="input w-full"
					class:error={$valueErrors[i]?.romaji}
					aria-invalid={$valueErrors[i]?.romaji ? 'true' : undefined}
					type="text"
					bind:value={$values[i].romaji}
				/>
			{/if}
			{#if $valueErrors[i]?.romaji}
				<span class="error-text-color">{$valueErrors[i]?.romaji}</span>
			{/if}

			<div class="flex flex-wrap gap-1 items-center justify-between">
				<button
					type="button"
					class="sub-btn"
					on:click={() => {
						handleRemoveTitle(i);
					}}>Remove title</button
				>
			</div>
		</div>
	{/each}
	<select
		aria-label="add title"
		on:change={handleAddTitle}
		class="input w-fit"
		name="add-titles"
		id="add-titles"
	>
		<option value="none">--Add title--</option>
		{#each languagesArray.filter((l) => !$values.some((t) => t.lang === l)) as code}
			<option value={code}>{languageNames[code]}</option>
		{/each}
	</select>

	{#if $errors}
		<p class="error-text-color">{$errors}</p>
	{/if}
</section>
