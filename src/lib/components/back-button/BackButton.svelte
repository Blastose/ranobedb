<script lang="ts">
	import Icon from '$lib/components/icon/Icon.svelte';
</script>

<button
	class="btn p-1 rounded-full focus-outline"
	aria-label="Go back one page"
	type="button"
	on:click={() => {
		history.back();
	}}
>
	<Icon height="24" width="24" name="arrowLeft" />
</button>
