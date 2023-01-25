<script lang="ts">
	type inputType = 'text' | 'password' | 'email';

	export let type: inputType = 'text';
	export let value: unknown;
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
		class="input"
		class:error
		bind:value
	/>
	{#if error}
		<span class="text-red-600 dark:text-red-400">{error}</span>
	{/if}
</div>

<style>
	:global(.input) {
		background-color: rgb(229 231 235);
		padding: 0.5rem 0.75rem;
		border-radius: 0.375rem;
	}

	:global(.input:focus) {
		outline: 2px solid transparent;
		outline-offset: 2px;

		box-shadow: 0 0 0 2px var(--primary-600);
	}

	:global(.input.error) {
		box-shadow: 0 0 0 2px rgb(238, 82, 82);
	}

	:global(.input:focus.error) {
		box-shadow: 0 0 0 2px rgb(238, 82, 82);
	}

	:global(.dark .input.error) {
		box-shadow: 0 0 0 2px rgb(248 113 113);
	}

	:global(.dark .input) {
		background-color: var(--dark-500);
		color: white;
	}
</style>
