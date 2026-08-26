<script lang="ts">
	import Icon from '../icon/Icon.svelte';

	interface Props {
		disabled?: boolean;
		text: string;
		submitting: boolean;
		delayed: boolean;
		name?: string | undefined;
		value?: string | undefined;
		wFull?: boolean;
	}

	let {
		disabled = false,
		text,
		submitting,
		delayed,
		name = undefined,
		value = undefined,
		wFull = true,
	}: Props = $props();
</script>

<button
	{name}
	{value}
	disabled={disabled || submitting}
	type="submit"
	class="primary-btn {wFull ? 'w-full' : ''}"
	class:loading={delayed}
>
	{#if !delayed}
		{text}
	{:else}
		<Icon name="loading" class="animate-spin" />
	{/if}
</button>
