<script lang="ts">
	// TODO - Using page store because Snippet doesn't work in Rune mode when mixing Legacy and Rune mode
	import { page } from '$app/stores';
</script>

{#key $page.url.search}
	<slot></slot>
{/key}
