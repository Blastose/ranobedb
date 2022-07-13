<script lang="ts">
	import { sidebarOpen } from '$lib/sidebarStore';
	import { windowWidth } from '$lib/windowWidthStore';

	export let text = '';
	export let onClickFunction = () => {};
</script>

<div class="hover:bg-[#cdcedd] rounded-md duration-75">
	<button
		class="w-full hover:bg-[#cdcedd] rounded-md duration-75 text-left"
		tabindex={$sidebarOpen ? 0 : -1}
		on:click={() => {
			onClickFunction();
			if ($windowWidth <= 1000) {
				sidebarOpen.set(false);
			}
		}}
	>
		<div class="px-4 py-1">
			<span>{text}</span>
		</div>
	</button>
</div>
