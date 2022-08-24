<script lang="ts">
	import { page } from '$app/stores';
	import { sidebarOpen } from '$lib/stores/sidebarStore';

	export let text = '';
	export let href: string | null = null;
	export let highlight = true;
	export let onClickFunction: () => void = () => {};
</script>

<!-- A bit of repetition here, maybe better way to simplify -->
{#if !href}
	<div class="flex items-center gap-1 px-2 py-1 dark:text-white">
		<slot />
		<span class="font-semibold">{text}</span>
	</div>
{:else}
	<div
		class="hover:bg-[#cdcedd] dark:hover:bg-[#38393a] {highlight && $page.url.pathname === href
			? 'bg-primary-500 hover:bg-primary-700 dark:hover:bg-primary-700 text-white'
			: 'active:bg-[#a5a6b8]'} rounded-md duration-75
			dark:text-white"
	>
		<a {href} sveltekit:prefetch tabindex={$sidebarOpen ? 0 : -1} on:click={onClickFunction}>
			<div class="flex items-center gap-1 px-2 py-1">
				<slot />
				<span class="font-semibold">{text}</span>
			</div>
		</a>
	</div>
{/if}
