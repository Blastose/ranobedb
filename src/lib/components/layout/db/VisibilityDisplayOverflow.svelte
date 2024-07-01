<script lang="ts" context="module">
	export type Rec = { hidden: boolean; locked: boolean; id: number };
</script>

<script lang="ts" generics="T extends Rec">
	import { languageNames } from '$lib/db/dbConsts';
	import type { CopyTo } from './VisibilityDisplay.svelte';
	import type { DbItem, Language } from '$lib/server/db/dbTypes';
	import { createDropdownMenu, melt } from '@melt-ui/svelte';
	import { fly } from 'svelte/transition';
	import Icon from '$lib/components/icon/Icon.svelte';

	export let item: T;
	export let type: DbItem;
	export let copyTo: CopyTo | undefined = undefined;
	export let revision: number | undefined;

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

	function buildBaseUrl(toType?: CopyTo['to'][number]) {
		let base = `/${type}/${item.id}/copy`;
		if (toType) {
			base += `/${toType}`;
		}
		return base;
	}

	function addRevisionParams(url: URL) {
		if (revision) {
			url.searchParams.set('revision', revision.toString());
		}
		return url;
	}

	function addLangParams(url: URL, lang: Language) {
		url.searchParams.set('lang', lang);
		return url;
	}

	function getHref(toType?: CopyTo['to'][number], lang?: Language) {
		// We only need the relative part of the url so we use localhost as a dummy base
		let url = new URL(buildBaseUrl(toType), 'http://localhost:5173');
		url = addRevisionParams(url);
		console.log(url.search);
		if (lang) {
			url = addLangParams(url, lang);
		}
		console.log(url.search);
		return url.pathname + url.search;
	}
</script>

<button use:melt={$trigger} class="open-menu-btn btn" type="button" aria-label="Open more options">
	<Icon name="dotsHorizontal" />
</button>

{#if $open}
	<section class="menu" use:melt={$menu} transition:fly={{ duration: 150, y: -10 }}>
		<a class="sidebar-item" use:melt={$itm} href={getHref()}>Copy</a>

		{#if copyTo}
			{#each copyTo.to as toType}
				{#if toType === 'release'}
					{#if copyTo.langs}
						<div use:melt={$subTrigger} class="cursor-pointer sidebar-item items-center">
							Copy as {toType}
							<div>
								<Icon name="chevronRight" width="20" height="20" />
							</div>
						</div>
						{#if $subOpen}
							<div class="menu" use:melt={$subMenu} transition:fly={{ duration: 150, x: -50 }}>
								{#each copyTo.langs as lang}
									<a class="sidebar-item" use:melt={$itm} href={getHref(toType, lang)}
										>Use {languageNames[lang]} title</a
									>
								{/each}
							</div>
						{/if}
					{:else}
						<a class="sidebar-item" href={getHref(toType)}>Copy as {toType}</a>
					{/if}
				{:else}
					<a class="sidebar-item" href={getHref(toType)}>Copy as {toType}</a>
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
