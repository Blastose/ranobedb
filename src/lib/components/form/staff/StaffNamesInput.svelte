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
		$values.push({
			staff_id: undefined,
			main_alias: false,
			name: '',
			romaji: undefined,
			aid: undefined
		});
		$values = $values;
	}
</script>

<section class="flex flex-col gap-2">
	<h2 class="font-bold text-lg">Names</h2>
	<div class="grid grid-cols-5 gap-2">
		<div class="bg-neutral-500">Orig</div>
		<div class="bg-neutral-500">Romaji</div>
		<div class="bg-neutral-500">Is Primary</div>
		<div class="bg-neutral-500">remove</div>
		<div class="bg-neutral-500">Reffed?</div>
		{#each $values as staff, i}
			<div><input class="input" placeholder="Name" type="text" bind:value={$values[i].name} /></div>
			<div>
				<input class="input" placeholder="Romaji" type="text" bind:value={$values[i].romaji} />
			</div>
			<div><input type="checkbox" bind:checked={$values[i].main_alias} />{staff.main_alias}</div>
			<button
				disabled={Boolean($values[i].ref_book_id)}
				type="button"
				on:click={() => {
					handleRemoveAlias(i);
				}}>Remove</button
			>
			<div>{Boolean($values[i].ref_book_id)}</div>
		{/each}
	</div>
	<button type="button" on:click={handleAddAlias}>Add name</button>
</section>
