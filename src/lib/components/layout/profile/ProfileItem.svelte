<script lang="ts">
	import { melt } from '@melt-ui/svelte';
	import type { DropdownMenu } from '@melt-ui/svelte';

	interface Props {
		text: string;
		href: string;
		item: DropdownMenu['elements']['item'];
		children?: import('svelte').Snippet;
	}

	let { text, href, item, children }: Props = $props();
</script>

<a {href} use:melt={$item}>
	<span class="sidebar-item">
		{@render children?.()}
		{text}
	</span>
</a>
