<script lang="ts">
	import { buildTitle } from './layout';

	export let title: string;
</script>

<svelte:head><title>{buildTitle(title)}</title></svelte:head>
