<script lang="ts">
	import { page } from '$app/stores';
</script>

{#key $page.url.search}
	<slot />
{/key}
