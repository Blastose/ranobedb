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
