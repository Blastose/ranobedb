<script lang="ts">
	import Hr from '../layout/Hr.svelte';

	export let hideHr: boolean = false;
</script>

<slot name="revision" />
<div class="content-jump" id="content">
	{#if !hideHr}
		<Hr />
	{/if}
</div>
<slot name="content" />
