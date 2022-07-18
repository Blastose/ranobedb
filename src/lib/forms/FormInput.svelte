<script lang="ts">
	export let type = 'text';
	export let value: any;
	export let labelName = '';
	export let id = '';
	export let placeholder = '';
	export let required = false;
	export let name = '';

	function typeAction(node: any) {
		node.type = type;
	}
</script>

<div class="flex flex-col gap-1">
	<label for={id}>
		<span>{labelName}</span>
		{#if required}
			<span class="text-red-600">*</span>
		{/if}
	</label>
	<input
		use:typeAction
		{name}
		{required}
		{id}
		{placeholder}
		class="bg-gray-200 px-3 py-2 rounded-md focus:outline-none focus:ring focus:ring-blue-400"
		bind:value
	/>
</div>
