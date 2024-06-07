<script lang="ts" context="module">
	export type Rec = { hidden: boolean; locked: boolean; id: number };
</script>

<script lang="ts" generics="T extends Rec">
	import { languageNames } from '$lib/db/dbConsts';
	import type { CopyTo } from './VisibilityDisplay.svelte';
	import type { DbItem } from '$lib/server/db/dbTypes';
	import { createDropdownMenu, melt } from '@melt-ui/svelte';
	import { fly } from 'svelte/transition';
	import Icon from '$lib/components/icon/Icon.svelte';

	export let item: T;
	export let type: DbItem;
	export let copyTo: CopyTo | undefined = undefined;

	const {
		elements: { trigger, menu, item: itm },
		builders: { createSubmenu },
		states: { open },
	} = createDropdownMenu({
		forceVisible: true,
		preventScroll: false,
	});

	const {
		elements: { subMenu, subTrigger },
		states: { subOpen },
	} = createSubmenu();
</script>

<button use:melt={$trigger} class="open-menu-btn btn" type="button" aria-label="Open more options">
	<Icon name="dotsHorizontal" />
</button>

{#if $open}
	<section class="menu" use:melt={$menu} transition:fly={{ duration: 150, y: -10 }}>
		<a class="sidebar-item" use:melt={$itm} href="/{type}/{item.id}/copy">Copy</a>

		{#if copyTo}
			{#each copyTo.to as i}
				{#if i === 'release'}
					{#if copyTo.langs}
						<div use:melt={$subTrigger} class="sidebar-item items-center">
							Copy as {i}
							<div>
								<Icon name="chevronRight" width="20" height="20" />
							</div>
						</div>
						{#if $subOpen}
							<div class="menu" use:melt={$subMenu} transition:fly={{ duration: 150, x: -50 }}>
								{#each copyTo.langs as lang}
									<a
										class="sidebar-item"
										use:melt={$itm}
										href="/{type}/{item.id}/copy/{i}?lang={lang}">Use {languageNames[lang]} title</a
									>
								{/each}
							</div>
						{/if}
					{:else}
						<a class="sidebar-item" href="/{type}/{item.id}/copy/{i}">Copy as {i}</a>
					{/if}
				{:else}
					<a class="sidebar-item" href="/{type}/{item.id}/copy/{i}">Copy as {i}</a>
				{/if}
			{/each}
		{/if}
	</section>
{/if}

<style>
	.open-menu-btn {
		border-radius: 9999px;
		transition-duration: 300ms;
	}

	.menu {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		background-color: var(--bg-light1);
		border-radius: 0.375rem;
		padding: 0.25rem;
		font-size: 0.875rem;
		line-height: 1.25rem;
		white-space: nowrap;
	}

	:global(.dark) .menu {
		background-color: var(--bg-dark1);
	}
</style>
