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
	class="dark:text-white 
	{highlight && $page.url.pathname === href
		? 'bg-primary-500 hover:bg-primary-800 dark:hover:bg-primary-800 text-white'
		: 'hover:bg-primary-300 dark:hover:bg-dark-500 active:bg-primary-400'} 
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
