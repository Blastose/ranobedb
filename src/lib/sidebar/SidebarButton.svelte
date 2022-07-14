<script lang="ts">
	import { sidebarOpen } from '$lib/sidebarStore';

	export let text = '';
	export let onClickFunction: () => void = () => {};
</script>

<div class="hover:bg-[#cdcedd] active:bg-[#a5a6b8] rounded-md duration-75">
	<button class="w-full text-left" tabindex={$sidebarOpen ? 0 : -1} on:click={onClickFunction}>
		<div class="px-4 py-1">
			<span>{text}</span>
		</div>
	</button>
</div>
