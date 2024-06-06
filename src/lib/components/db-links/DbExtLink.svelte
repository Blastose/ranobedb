<script lang="ts">
	import { buildLink, type FullLink } from './db-ext-links';

	export let fullLink: FullLink;
	$: href = buildLink(fullLink);
</script>

<a class="link" {href} target="_blank">{href}</a>
