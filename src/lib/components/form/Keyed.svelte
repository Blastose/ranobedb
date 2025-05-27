<script lang="ts">
	import { page } from '$app/state';
</script>

{#key page.url.search}
	<slot />
{/key}
