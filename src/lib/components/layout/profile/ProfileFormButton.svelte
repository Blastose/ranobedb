<script lang="ts">
	import { DropdownMenu } from 'bits-ui';
	import { enhance } from '$app/forms';
	import type { Snippet } from 'svelte';

	interface Props {
		text: string;
		action: string;
		children?: Snippet;
	}

	let { text, action, children }: Props = $props();
</script>

<DropdownMenu.Item>
	{#snippet child({ props })}
		<form method="post" {action} use:enhance>
			<button type="submit" class="sidebar-item" {...props}>
				{@render children?.()}
				{text}
			</button>
		</form>
	{/snippet}
</DropdownMenu.Item>
