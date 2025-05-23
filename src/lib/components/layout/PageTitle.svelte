<script lang="ts">
	import { buildTitle } from './layout';

	interface Props {
		title: string;
	}

	let { title }: Props = $props();
</script>

<svelte:head><title>{buildTitle(title)}</title></svelte:head>
