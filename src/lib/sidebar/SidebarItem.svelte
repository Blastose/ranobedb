<script lang="ts">
	import { page } from '$app/stores';
	import { sidebarOpen } from '$lib/stores/sidebarStore';

	export let text = '';
	export let href = '';
	export let highlight = true;
	export let onClickFunction: () => void = () => {};
</script>

<div
	class="hover:bg-[#cdcedd] {highlight && $page.url.pathname === href
		? 'bg-[#73739C] hover:bg-[#474963] text-white'
		: 'active:bg-[#a5a6b8]'} rounded-md duration-75"
>
	<a {href} sveltekit:prefetch tabindex={$sidebarOpen ? 0 : -1} on:click={onClickFunction}>
		<div class="px-4 py-1">
			<span>{text}</span>
		</div>
	</a>
</div>
