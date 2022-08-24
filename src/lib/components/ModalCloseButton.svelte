<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';

	export let onClose: () => {};
</script>

<button
	on:click={onClose}
	class="
	block absolute z-[1000] top-4 right-4 p-1 rounded-lg duration-150
	hover:bg-[#cdcedd]
	dark:text-white dark:hover:text-black
	active:scale-95
	"
>
	<Icon height="20" width="20" name="close" />
</button>
