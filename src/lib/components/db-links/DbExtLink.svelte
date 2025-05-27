<script lang="ts">
	import { buildLink, type FullLink } from './db-ext-links';

	interface Props {
		fullLink: FullLink;
	}

	let { fullLink }: Props = $props();
	let href = $derived(buildLink(fullLink));
</script>

<a class="link" {href} target="_blank">{href}</a>
