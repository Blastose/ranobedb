<script lang="ts">
	import { DropdownMenu } from 'bits-ui';
	import type { Snippet } from 'svelte';

	interface Props {
		text: string;
		href: string;
		children?: Snippet;
	}

	let { text, href, children }: Props = $props();
</script>

<DropdownMenu.Item>
	{#snippet child({ props })}
		<a {href} {...props}>
			<span class="sidebar-item">
				{@render children?.()}
				{text}
			</span>
		</a>
	{/snippet}
</DropdownMenu.Item>
