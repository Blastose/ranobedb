<script lang="ts">
	import { languageNames, type Language } from '$lib/db/dbTypes';
	import type { bookSchema } from '$lib/zod/schema';
	import type { Writable } from 'svelte/store';
	import { type Infer, type SuperValidated } from 'sveltekit-superforms';

	export let form: Writable<SuperValidated<Infer<typeof bookSchema>>['data']>;

	function handleRemoveTitle(index: number) {
		$form.titles.splice(index, 1);
		$form.titles = $form.titles;
	}

	function handleAddTitle(e: Event & { currentTarget: EventTarget & HTMLSelectElement }) {
		if (e.currentTarget.value === 'none') return;

		$form.titles.push({
			lang: e.currentTarget.value as Language,
			official: false,
			title: '',
			romaji: ''
		});
		$form.titles = $form.titles;
		e.currentTarget.selectedIndex = 0;
	}
</script>

<section class="flex flex-col gap-2">
	<h2 class="font-bold text-lg">Titles</h2>
	{#each $form.titles as title, i}
		<div class="flex flex-col gap-2">
			<p>{languageNames[title.lang]}</p>
			<input
				placeholder="Title in {languageNames[title.lang]}"
				class="input w-full"
				type="text"
				bind:value={$form.titles[i].title}
			/>
			<input
				placeholder="Romanization (leave empty if the title is already in romaji)"
				class="input w-full"
				type="text"
				bind:value={$form.titles[i].romaji}
			/>

			<div class="flex flex-wrap gap-1 items-center justify-between">
				<label class="flex gap-1"
					><input type="checkbox" bind:checked={$form.titles[i].official} /><span
						>Official title (from the book publisher; not a fan TL)</span
					></label
				>

				{#if title.lang !== 'ja'}
					<button
						type="button"
						class="sub-btn"
						on:click={() => {
							handleRemoveTitle(i);
						}}>Remove title</button
					>
				{/if}
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
		{#each Object.entries(languageNames).filter((l) => !$form.titles.some((t) => t.lang === l[0])) as [code, lang]}
			<option value={code}>{lang}</option>
		{/each}
	</select>
</section>
