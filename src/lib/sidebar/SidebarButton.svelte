<script lang="ts">
	import { sidebarOpen } from '$lib/stores/sidebarStore';

	export let text = '';
	export let onClickFunction: () => void = () => {};
</script>

<div class="hover:bg-primary-300 active:bg-primary-400 rounded-md duration-75">
	<button class="w-full text-left" tabindex={$sidebarOpen ? 0 : -1} on:click={onClickFunction}>
		<div class="px-4 py-1">
			<span>{text}</span>
		</div>
	</button>
</div>
