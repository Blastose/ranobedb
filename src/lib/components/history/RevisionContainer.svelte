<script lang="ts">
	import Hr from '../layout/Hr.svelte';
</script>

<slot name="revision" />
<div class="content-jump" id="content">
	<Hr />
</div>
<slot name="content" />
