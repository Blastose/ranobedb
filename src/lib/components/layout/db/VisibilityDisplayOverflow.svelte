<script lang="ts" module>
	export type Rec = { hidden: boolean; locked: boolean; id: number };
</script>

<script lang="ts" generics="T extends Rec">
	import { languageNames } from '$lib/db/dbConsts';
	import type { CopyTo } from './VisibilityDisplay.svelte';
	import type { DbItem, Language } from '$lib/server/db/dbTypes';
	import { DropdownMenu } from 'bits-ui';
	import { fly } from 'svelte/transition';
	import Icon from '$lib/components/icon/Icon.svelte';

	interface Props {
		item: T;
		type: DbItem;
		copyTo?: CopyTo | undefined;
		revision: number | undefined;
	}

	let { item, type, copyTo = undefined, revision }: Props = $props();

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
		if (lang) {
			url = addLangParams(url, lang);
		}
		return url.pathname + url.search;
	}
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<button {...props} type="button" class="open-menu-btn btn" aria-label="Open more options">
				<Icon name="dotsHorizontal" />
			</button>
		{/snippet}
	</DropdownMenu.Trigger>

	<DropdownMenu.Content forceMount side="bottom" align="center" sideOffset={6}>
		{#snippet child({ props, wrapperProps, open })}
			{#if open}
				<div {...wrapperProps}>
					<div {...props} class="menu" transition:fly={{ duration: 150, y: -10 }}>
						<DropdownMenu.Item>
							{#snippet child({ props })}
								<a {...props} class="sidebar-item" href={getHref()}>Copy</a>
							{/snippet}
						</DropdownMenu.Item>

						{#if copyTo}
							{#each copyTo.to as toType}
								{#if toType === 'release'}
									{#if copyTo.langs}
										<DropdownMenu.Sub>
											<DropdownMenu.SubTrigger class="sidebar-item cursor-pointer items-center">
												Copy as {toType}
												<div>
													<Icon name="chevronRight" width="20" height="20" />
												</div>
											</DropdownMenu.SubTrigger>
											<DropdownMenu.SubContent forceMount side="right" align="start" sideOffset={8}>
												{#snippet child({ props, wrapperProps, open: subOpen })}
													{#if subOpen}
														<div {...wrapperProps}>
															<div
																{...props}
																class="menu"
																transition:fly={{ duration: 150, x: -50 }}
															>
																{#each copyTo.langs as lang}
																	<DropdownMenu.Item>
																		{#snippet child({ props })}
																			<a
																				{...props}
																				class="sidebar-item"
																				href={getHref(toType, lang)}
																				>Use {languageNames[lang]} title</a
																			>
																		{/snippet}
																	</DropdownMenu.Item>
																{/each}
															</div>
														</div>
													{/if}
												{/snippet}
											</DropdownMenu.SubContent>
										</DropdownMenu.Sub>
									{:else}
										<DropdownMenu.Item>
											{#snippet child({ props })}
												<a {...props} class="sidebar-item" href={getHref(toType)}
													>Copy as {toType}</a
												>
											{/snippet}
										</DropdownMenu.Item>
									{/if}
								{:else}
									<DropdownMenu.Item>
										{#snippet child({ props })}
											<a {...props} class="sidebar-item" href={getHref(toType)}>Copy as {toType}</a>
										{/snippet}
									</DropdownMenu.Item>
								{/if}
							{/each}
						{/if}
					</div>
				</div>
			{/if}
		{/snippet}
	</DropdownMenu.Content>
</DropdownMenu.Root>

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
		z-index: 40;
	}

	:global(.dark) .menu {
		background-color: var(--bg-dark1);
	}
</style>
