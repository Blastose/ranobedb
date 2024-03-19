<script lang="ts">
	import { seriesRelTypeArray } from '$lib/db/dbTypes';
	import type { seriesSchema } from '$lib/zod/schema';
	import ComboboxInput from '../ComboboxInput.svelte';

	import { type SuperForm, arrayProxy, type Infer } from 'sveltekit-superforms';

	export let form: SuperForm<Infer<typeof seriesSchema>, App.Superforms.Message>;

	const { values, errors, valueErrors } = arrayProxy(form, 'child_series');
	function handleRemoveSeries(index: number) {
		$values.splice(index, 1);
		$values = $values;
	}

	function handleAddSeries(series: { id: number; name: string }) {
		$values.push({
			title: series.name,
			id: series.id,
			romaji: '',
			relation_type: 'parent story'
		});
		$values = $values;
	}

	async function search(inputValue: string) {
		const res = await fetch(`/api/i/series?name=${inputValue}`);
		const json = await res.json();
		return json;
	}
</script>

<section class="flex flex-col gap-2">
	<h2 class="text-lg font-bold">Series Relations</h2>
	<div class="flex gap-6 flex-wrap">
		{#each $values as series, i}
			<div class="flex flex-col gap-2 flex-wrap">
				<a class="link w-fit" target="_blank" rel="noreferrer" href="/series/{series.id}"
					><span class="text-sm">#{series.id}:</span> {series.title}</a
				>
				<label class="flex gap-2 items-center"
					><span>Relation type: </span>
					<select
						name="series-role"
						class="input reset-padding"
						bind:value={$values[i].relation_type}
					>
						{#each seriesRelTypeArray as rel_type}
							<option value={rel_type} selected={rel_type === $values[i].relation_type}
								>{rel_type}</option
							>
						{/each}
					</select>
				</label>
				<button
					on:click={() => {
						handleRemoveSeries(i);
					}}
					type="button"
					class="sub-btn w-fit">Remove</button
				>
			</div>
		{/each}
		<ComboboxInput handleAdd={handleAddSeries} {search} title="Add series" />
	</div>
	{#if $errors}
		<p class="error-text-color">{$errors}</p>
	{/if}
</section>
