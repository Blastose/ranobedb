<script lang="ts">
	export let labelName = '';
	export let id = '';
	export let name = '';
	export let selectedValue = '';
	export let options: { value: string; name: string }[];
</script>

<div class="flex flex-col gap-1 w-min">
	<label for={id}>{labelName}</label>
	<select class="focus-outline" {name} {id}>
		{#each options as option}
			<option value={option.value} selected={selectedValue === option.value}>{option.name}</option>
		{/each}
	</select>
</div>

<style>
	select {
		border-radius: 0.375rem;
		background-color: rgb(229 231 235);
		padding: 0.25rem 0.5rem;
	}

	:global(.dark) select {
		background-color: var(--dark-500);
	}
</style>
