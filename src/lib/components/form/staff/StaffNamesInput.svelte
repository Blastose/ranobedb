<script lang="ts">
	import type { staffSchema } from '$lib/zod/schema';
	import { type SuperForm, arrayProxy, type Infer } from 'sveltekit-superforms';

	export let form: SuperForm<Infer<typeof staffSchema>, App.Superforms.Message>;

	const { values, errors, valueErrors } = arrayProxy(form, 'aliases');

	function handleRemoveAlias(index: number) {
		$values.splice(index, 1);
		$values = $values;
	}

	function handleAddAlias(_: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		if ($values.length > 20) return;
		$values.push({
			staff_id: undefined,
			main_alias: false,
			name: '',
			romaji: undefined,
			aid: undefined
		});
		$values = $values;
	}

	function handleCheckboxClick(e: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		const checkboxes = document.querySelectorAll<HTMLInputElement>(
			'input[type="radio"][name="main-alias"]'
		);
		for (const [index, c] of checkboxes.entries()) {
			if (e.currentTarget !== c) {
				c.checked = false;
				$values[index].main_alias = false;
			} else {
				c.checked = true;
				$values[index].main_alias = true;
			}
		}
	}
</script>

<section class="flex flex-col gap-2">
	<h2 class="font-bold text-lg">Names</h2>
	<div class="flex flex-col gap-2">
		{#each $values as staff, i}
			<div class="flex gap-2 flex-wrap">
				<div class="flex flex-col gap-2 w-[256px]">
					<label class="flex flex-col gap-2">
						<span>Name (in original script)</span>
						<input
							name="name"
							class="input"
							type="text"
							placeholder="Name"
							bind:value={$values[i].name}
							class:error={$valueErrors[i]?.name}
							aria-invalid={$valueErrors[i]?.name ? 'true' : undefined}
						/>
					</label>
					{#if $valueErrors[i]?.name}
						<span class="error-text-color">{$valueErrors[i]?.name}</span>
					{/if}
				</div>
				<div class="flex flex-col gap-2 w-[256px]">
					<label class="flex flex-col gap-2">
						<span>Romanization</span>
						<input
							name="romaji"
							class="input"
							type="text"
							placeholder="Romanization"
							bind:value={$values[i].romaji}
							class:error={$valueErrors[i]?.romaji}
							aria-invalid={$valueErrors[i]?.romaji ? 'true' : undefined}
						/>
					</label>
					{#if $valueErrors[i]?.romaji}
						<span class="error-text-color">{$valueErrors[i]?.romaji}</span>
					{/if}
				</div>
				<label class="flex flex-col gap-2">
					<span>Primary name?</span>
					<span class="h-[40px] flex items-center justify-center"
						><input
							name="main-alias"
							checked={$values[i].main_alias}
							on:change={handleCheckboxClick}
							type="radio"
						/></span
					>
				</label>
				<div class="flex flex-col gap-2">
					<span class="invisible">Hidden for padding</span>
					<button
						disabled={Boolean($values[i].ref_book_id) || $values[i].main_alias}
						class="sub-btn h-fit"
						class:loading={Boolean($values[i].ref_book_id) || $values[i].main_alias}
						type="button"
						on:click={() => {
							handleRemoveAlias(i);
						}}
						>{$values[i].main_alias
							? 'Primary'
							: Boolean($values[i].ref_book_id)
							? 'Referenced'
							: 'Remove'}</button
					>
				</div>
			</div>
		{/each}
		<button class="primary-btn mt-2 w-fit" type="button" on:click={handleAddAlias}>Add name</button>
	</div>
</section>
