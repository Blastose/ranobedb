<script lang="ts">
	interface Props {
		active: boolean;
		text: string;
		href: string;
		children?: import('svelte').Snippet;
	}

	let { active, text, href, children }: Props = $props();
</script>

<a {href}>
	<span class:active class="sidebar-item">
		{@render children?.()}
		{text}
	</span>
</a>
