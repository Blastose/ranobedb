<script lang="ts">
	import { buildLink, type FullLink } from './db-ext-links';

	interface Props {
		fullLink: FullLink;
		shortName?: string | undefined;
	}

	let { fullLink, shortName = undefined }: Props = $props();
	let href = $derived(buildLink(fullLink));
</script>

<a class="link" {href} target="_blank">{shortName || fullLink.name}</a>
