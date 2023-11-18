<script lang="ts">
	import { melt } from '@melt-ui/svelte';
	import type { DropdownMenu } from '@melt-ui/svelte';
	import { enhance } from '$app/forms';

	export let text: string;
	export let item: DropdownMenu['elements']['item'];
	export let action: string;
</script>

<form method="post" {action} use:enhance>
	<button type="submit" class="sidebar-item" use:melt={$item}>
		<slot />
		{text}
	</button>
</form>

<style>
	.sidebar-item {
		transition: background-color 300ms;
		border-radius: 0.375rem;
		display: flex;
		gap: 0.5rem;
		padding: 0.25rem 0.5rem;
		text-align: left;
		width: 100%;
	}

	.sidebar-item:hover {
		background-color: rgb(202, 202, 214);
	}

	:global(.dark) .sidebar-item {
		color: var(--text-dark);
	}

	:global(.dark) .sidebar-item:hover {
		background-color: rgb(74, 74, 78);
	}
</style>
