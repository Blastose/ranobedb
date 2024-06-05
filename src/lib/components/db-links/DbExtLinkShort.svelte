<script lang="ts">
	import { buildLink, type FullLink } from './db-ext-links';

	export let fullLink: FullLink;
	export let shortName: string | undefined = undefined;
	$: href = buildLink(fullLink);
</script>

<a class="link" {href} target="_blank">{shortName || fullLink.name}</a>
