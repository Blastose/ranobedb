<script lang="ts">
	import type { seriesSchema } from '$lib/server/zod/schema';
	import { seriesRelTypeArray } from '$lib/db/dbConsts';
	import ComboboxInput from '../ComboboxInput.svelte';
	import { type SuperForm, arrayProxy, type Infer } from 'sveltekit-superforms';
	import type { ApiSeries } from '../../../../routes/api/i/series/+server';
	import TitleDisplay from '$lib/components/display/TitleDisplay.svelte';

	interface Props {
		form: SuperForm<Infer<typeof seriesSchema>, App.Superforms.Message>;
		seriesId: number | undefined;
	}

	let { form, seriesId }: Props = $props();

	// svelte-ignore state_referenced_locally
	const { values, errors, valueErrors } = arrayProxy(form, 'child_series');
	function handleRemoveSeries(index: number) {
		$values.splice(index, 1);
		$values = $values;
	}

	function handleAddSeries(series: ApiSeries[number]) {
		$values.push({
			title: series.name,
			id: series.id,
			romaji: series.romaji,
			lang: series.lang,
			relation_type: 'parent story',
		});
		$values = $values;
	}

	async function search(inputValue: string) {
		const res = await fetch(`/api/i/series?name=${encodeURIComponent(inputValue)}`);
		const json = await res.json();
		return json;
	}
</script>

<section class="flex flex-col gap-2">
	<h2 class="text-lg font-bold">Series Relations</h2>
	<div class="flex flex-col flex-wrap gap-2">
		{#each $values as series, i}
			<div class="flex flex-col flex-wrap gap-2">
				<a class="link w-fit" target="_blank" rel="noreferrer" href="/series/{series.id}"
					><span class="text-sm">#{series.id}:</span>
					<TitleDisplay
						obj={{
							lang: series.lang ?? 'en',
							romaji: series.romaji ?? '',
							romaji_orig: null,
							title: series.title ?? '',
							title_orig: '',
						}}
					/></a
				>
				<label class="flex items-center gap-2"
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
					onclick={() => {
						handleRemoveSeries(i);
					}}
					type="button"
					class="sub-btn w-fit">Remove</button
				>
			</div>
		{/each}
		<ComboboxInput
			handleAdd={handleAddSeries}
			{search}
			title="Add series"
			selectedItems={[...$values, { id: seriesId ?? -1 }]}
			filterDuplicateIds={true}
		/>
	</div>
	{#if $errors}
		<p class="error-text-color">{$errors}</p>
	{/if}
</section>
