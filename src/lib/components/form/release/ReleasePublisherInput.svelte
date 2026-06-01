<script lang="ts" generics="T extends Record<string, unknown>, F extends FormPathArrays<T>">
	import { releasePublisherTypeArray } from '$lib/db/dbConsts';
	import {
		type SuperForm,
		arrayProxy,
		type FormPathArrays,
		type ArrayProxy,
		type FormPathType,
	} from 'sveltekit-superforms';
	import ComboboxInput from '../ComboboxInput.svelte';
	import type { ApiPublisher } from '../../../../routes/api/i/publisher/+server';
	import NameDisplay from '$lib/components/display/NameDisplay.svelte';
	import type { ReleasePublisherType } from '$lib/server/db/dbTypes';
	import { onMount } from 'svelte';

	export let form: SuperForm<T, App.Superforms.Message>;
	export let field: FormPathType<T, F> extends Publisher[] ? F : never;

	type Publisher = {
		name: string;
		romaji?: string | null;
		id: number;
		publisher_type: ReleasePublisherType;
	};

	const STORAGE_KEY = 'releasePublisherInput:recentPublishers';
	const MAX_RECENT = 10;

	const { values, errors, valueErrors } = arrayProxy(
		form,
		field,
	) as unknown as ArrayProxy<Publisher>;

	let recentPublishers: ApiPublisher = [];

	onMount(() => {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			try {
				recentPublishers = JSON.parse(stored);
			} catch {}
		}
	});

	$: recentPublishersFiltered = recentPublishers.filter(
		(rp) => !$values.some((v) => v.id === rp.id),
	);

	function saveRecent() {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(recentPublishers));
	}

	function addToRecent(publisher: ApiPublisher[number]) {
		recentPublishers = [publisher, ...recentPublishers.filter((p) => p.id !== publisher.id)].slice(
			0,
			MAX_RECENT,
		);
		saveRecent();
	}

	function handleRemovePublisher(index: number) {
		$values.splice(index, 1);
		$values = $values;
	}

	function handleAddPublisher(publisher: ApiPublisher[number]) {
		$values.push({
			name: publisher.name,
			id: publisher.id,
			romaji: publisher.romaji,
			publisher_type: 'publisher',
		});
		$values = $values;
		addToRecent(publisher);
	}

	async function search(inputValue: string) {
		const res = await fetch(`/api/i/publisher?name=${encodeURIComponent(inputValue)}`);
		const json = await res.json();
		return json;
	}

	function clearRecent() {
		recentPublishers = [];
		localStorage.removeItem(STORAGE_KEY);
	}
</script>

<section class="flex flex-col gap-2">
	<h2 class="text-lg font-bold">Publisher Relations</h2>

	<div class="flex flex-col gap-2">
		<div class="flex gap-6 flex-wrap">
			{#each $values as publisher, i}
				<div class="flex flex-col gap-2 flex-wrap">
					<a class="link w-fit" target="_blank" rel="noreferrer" href="/publisher/{publisher.id}"
						><span class="text-sm">#{publisher.id}:</span> <NameDisplay obj={publisher} /></a
					>
					<label class="flex gap-2 items-center"
						><span>Type: </span>
						<select
							name="publisher-role"
							class="input reset-padding"
							bind:value={$values[i].publisher_type}
						>
							{#each releasePublisherTypeArray as rel_type}
								<option value={rel_type} selected={rel_type === $values[i].publisher_type}
									>{rel_type}</option
								>
							{/each}
						</select>
					</label>
					<button
						onclick={() => {
							handleRemovePublisher(i);
						}}
						type="button"
						class="sub-btn w-fit">Remove</button
					>
				</div>
			{/each}
			<ComboboxInput
				handleAdd={handleAddPublisher}
				{search}
				title="Add publisher"
				selectedItems={$values}
				filterDuplicateIds={false}
			/>
		</div>
		{#if recentPublishersFiltered.length > 0}
			<div class="flex flex-col gap-1">
				<div class="flex items-center gap-2">
					<span class="text-sm font-medium">Recently used publishers:</span>
					{#if recentPublishersFiltered.length > 0}
						<button type="button" onclick={clearRecent} class="sub-btn !text-xs !px-2 !py-0"
							>Clear</button
						>
					{/if}
				</div>
				<div class="flex flex-wrap gap-2">
					{#each recentPublishers.filter((rp) => !$values.some((v) => v.id === rp.id)) as publisher (publisher.id)}
						<button
							type="button"
							onclick={() => handleAddPublisher(publisher)}
							class="flex gap-1 items-center rounded-2xl tag-chip px-2 text-sm"
						>
							<NameDisplay obj={publisher} />
						</button>
					{/each}
				</div>
			</div>
		{/if}
	</div>
	{#if $errors}
		<p class="error-text-color">{$errors}</p>
	{/if}
</section>
