<script lang="ts">
	import Hr from '../layout/Hr.svelte';

	interface Props {
		hideHr?: boolean;
		revision?: import('svelte').Snippet;
		content?: import('svelte').Snippet;
	}

	let { hideHr = false, revision, content }: Props = $props();
</script>

{@render revision?.()}
<div class="content-jump" id="content">
	{#if !hideHr}
		<Hr />
	{/if}
</div>
{@render content?.()}
