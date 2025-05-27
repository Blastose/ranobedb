<script lang="ts">
	import { melt } from '@melt-ui/svelte';
	import type { DropdownMenu } from '@melt-ui/svelte';
	import { enhance } from '$app/forms';

	interface Props {
		text: string;
		item: DropdownMenu['elements']['item'];
		action: string;
		children?: import('svelte').Snippet;
	}

	let { text, item, action, children }: Props = $props();
</script>

<form method="post" {action} use:enhance>
	<button type="submit" class="sidebar-item" use:melt={$item}>
		{@render children?.()}
		{text}
	</button>
</form>
