<script lang="ts">
	import { page } from '$app/stores';
	import { sidebarOpen } from '$lib/sidebarStore';
	import { windowWidth } from '$lib/windowWidthStore';

	export let text = '';
	export let href: string | null = null;
</script>

<!-- A bit of repetition here, maybe better way to simplify -->
{#if !href}
	<div class="flex items-center gap-1 px-2 py-1">
		<slot />
		<span class="font-semibold">{text}</span>
	</div>
{:else}
	<div
		class="hover:bg-[#cdcedd] {$page.url.pathname === href
			? 'bg-blue-200 hover:bg-blue-300'
			: 'active:bg-[#a5a6b8]'} rounded-md duration-75"
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
			<div class="flex items-center gap-1 px-2 py-1">
				<slot />
				<span class="font-semibold">{text}</span>
			</div>
		</a>
	</div>
{/if}
