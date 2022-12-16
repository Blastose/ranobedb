<script lang="ts">
	import Icon from '$lib/components/icon/Icon.svelte';
	import type { IconType } from '$lib/components/icon/Icon.svelte';

	export let text: string;
	export let size: string;
	export let icon: IconType | null;
</script>

<div class="content {size === 'small' ? 'text-xs' : 'text-sm'}">
	{#if icon}
		<span>
			<Icon
				height={size === 'small' ? '16' : '20'}
				width={size === 'small' ? '16' : '20'}
				name={icon}
			/>
		</span>
	{/if}
	<span>{text}</span>
</div>

<style>
	.content {
		display: flex;
		gap: 0.25rem;
		align-items: center;
		justify-content: center;
		padding: 0.25rem;
	}
</style>
