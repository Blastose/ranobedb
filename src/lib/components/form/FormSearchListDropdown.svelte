<script lang="ts">
	export let item: any;
	export let itemAttribute: string;
	export let dropdownValues: readonly string[];
	export let updateItems: () => void;
</script>

<label class="capitalize" for="{itemAttribute}{item.id}{item[itemAttribute]}"
	>{itemAttribute}:</label
>
<select
	id="{itemAttribute}{item.id}{item[itemAttribute]}"
	on:change={(e) => {
		item[itemAttribute] = e.currentTarget.value;
		updateItems();
	}}
>
	{#each dropdownValues as value}
		<option selected={value === item[itemAttribute]}>{value}</option>
	{/each}
</select>

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
