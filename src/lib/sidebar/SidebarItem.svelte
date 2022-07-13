<script lang="ts">
	import { page } from '$app/stores';
	import { sidebarOpen } from '$lib/sidebarStore';
	import { windowWidth } from '$lib/windowWidthStore';

	export let text = '';
	export let href = '';
</script>

<div
	class="hover:bg-[#cdcedd] {$page.url.pathname === href
		? 'bg-blue-200 hover:bg-blue-300'
		: ''} rounded-md duration-75"
>
	<a
		{href}
		tabindex={$sidebarOpen ? 0 : -1}
		on:click={() => {
			if ($windowWidth <= 1000) {
				sidebarOpen.set(false);
			}
		}}
	>
		<div class="px-4 py-1">
			<span>{text}</span>
		</div>
	</a>
</div>
