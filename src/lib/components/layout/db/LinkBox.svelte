<script lang="ts">
	interface Props {
		display?: string | undefined;
		wrap?: boolean;
		href: string;
		children?: import('svelte').Snippet;
	}

	let { display = undefined, wrap = false, href, children }: Props = $props();
</script>

<div class="link-box" class:round={true}>
	<a class={wrap ? '' : 'single-line'} {href}
		>{#if display}{display}{:else}{@render children?.()}{/if}</a
	>
</div>

<style>
	a {
		display: block;
		padding: 0.5rem 1rem;
		max-width: 100%;
	}

	a.single-line {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>
