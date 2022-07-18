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
	<div class="flex items-center gap-1 px-2 py-1">
		<slot />
		<span class="font-semibold">{text}</span>
	</div>
{:else}
	<div
		class="hover:bg-[#cdcedd] {highlight && $page.url.pathname === href
			? 'bg-[#73739C] hover:bg-[#474963] text-white'
			: 'active:bg-[#a5a6b8]'} rounded-md duration-75"
	>
		<a {href} sveltekit:prefetch tabindex={$sidebarOpen ? 0 : -1} on:click={onClickFunction}>
			<div class="flex items-center gap-1 px-2 py-1">
				<slot />
				<span class="font-semibold">{text}</span>
			</div>
		</a>
	</div>
{/if}
