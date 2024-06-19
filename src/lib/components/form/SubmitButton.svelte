<script lang="ts">
	import Icon from '../icon/Icon.svelte';

	export let disabled: boolean = false;
	export let text: string;
	export let submitting: boolean;
	export let delayed: boolean;
	export let name: string | undefined = undefined;
	export let value: string | undefined = undefined;
</script>

<button
	{name}
	{value}
	disabled={disabled || submitting}
	type="submit"
	class="primary-btn w-full"
	class:loading={delayed}
>
	{#if !delayed}
		{text}
	{:else}
		<Icon name="loading" class="animate-spin" />
	{/if}
</button>
