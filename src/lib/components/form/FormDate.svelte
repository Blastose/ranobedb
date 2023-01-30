<script lang="ts">
	export let labelName = '';
	export let id = '';
	export let name = '';
	export let value: string | null;
</script>

<div class="flex flex-col gap-1 w-min">
	<label for={id}>{labelName}</label>
	<input class="focus-outline" type="date" {id} {name} bind:value />
</div>

<style>
	input {
		border-radius: 0.375rem;
		background-color: rgb(229 231 235);
		padding: 0.25rem 0.5rem;
	}

	:global(.dark) input {
		background-color: var(--dark-500);
	}
</style>
