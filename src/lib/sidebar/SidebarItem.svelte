<script lang="ts">
	import { page } from '$app/stores';
	import { sidebarOpen } from '$lib/stores/sidebarStore';

	export let text = '';
	export let href = '';
	export let highlight = true;
	export let onClickFunction: () => void = () => {};
	export let prefetch = null;
</script>

<div
	class="hover:bg-[#cdcedd] dark:hover:bg-[#38393a] dark:text-white 
	{highlight && $page.url.pathname === href
		? 'bg-primary-500 hover:bg-primary-700 dark:hover:bg-primary-700 text-white'
		: 'active:bg-[#a5a6b8]'} 
		rounded-md duration-75"
>
	<a
		{href}
		sveltekit:prefetch={prefetch}
		tabindex={$sidebarOpen ? 0 : -1}
		on:click={onClickFunction}
	>
		<div class="px-4 py-1">
			<span>{text}</span>
		</div>
	</a>
</div>
