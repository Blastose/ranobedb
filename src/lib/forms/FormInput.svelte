<script lang="ts">
	export let type = 'text';
	export let value: any;
	export let labelName = '';
	export let id = '';
	export let placeholder = '';
	export let required = false;
	export let name = '';
	export let error = '';

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
		on:input={() => (error = '')}
		{name}
		{required}
		{id}
		{placeholder}
		class="
			{error ? 'ring-2 ring-red-600' : ''}
		bg-gray-200 px-3 py-2 rounded-md focus:outline-none focus:ring focus:ring-[#6b6e92]
		"
		bind:value
	/>
	{#if error}
		<span class="text-red-600">{error}</span>
	{/if}
</div>
