<script lang="ts">
	type inputType = 'text' | 'password' | 'email';

	export let type: inputType = 'text';
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
		<span class="dark:text-white">{labelName}</span>
		{#if required}
			<span class="text-red-600 dark:text-red-400">*</span>
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
		bg-gray-200 dark:bg-dark-500 dark:text-white px-3 py-2 rounded-md focus:outline-none focus:ring focus:ring-primary-600
			{error ? 'ring-2 ring-red-600 focus:ring focus:ring-red-600 dark:ring-red-400' : ''}
		"
		bind:value
	/>
	{#if error}
		<span class="text-red-600 dark:text-red-400">{error}</span>
	{/if}
</div>
