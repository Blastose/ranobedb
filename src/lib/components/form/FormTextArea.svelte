<script lang="ts">
	export let value: any;
	export let labelName = '';
	export let id = '';
	export let placeholder = '';
	export let required = false;
	export let name = '';
	export let error = '';
	export let rows = 4;
</script>

<div class="flex flex-col gap-1">
	{#if labelName}
		<label for={id}>
			<span class="dark:text-white">{labelName}</span>
			{#if required}
				<span class="text-red-600 dark:text-red-400">*</span>
			{/if}
		</label>
	{/if}
	<textarea
		on:input={() => (error = '')}
		{name}
		{required}
		{id}
		{placeholder}
		{rows}
		class="input"
		class:error
		bind:value
	/>
	{#if error}
		<span class="text-red-600 dark:text-red-400">{error}</span>
	{/if}
</div>

<style>
	.input {
		background-color: rgb(229 231 235);
		padding: 0.5rem 0.75rem;
		border-radius: 0.375rem;
	}

	:global(.dark) .input {
		background-color: var(--dark-500);
		color: white;
	}
</style>
