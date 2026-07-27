<script lang="ts">
	import { buildLink, getDomain, linkColors, type FullLink } from './db-ext-links';
	import Icon from '$lib/components/icon/Icon.svelte';
	import Favicon from './Favicon.svelte';

	interface Props {
		fullLink?: FullLink;
		href?: string;
		name?: string;
		shortName?: string;
		domain?: string;
	}

	let { fullLink, href: rawHref, name, shortName, domain: explicitDomain }: Props = $props();

	let resolved = $derived.by(() => {
		if (fullLink) {
			return {
				href: buildLink(fullLink),
				name: fullLink.name,
				domain: explicitDomain ?? getDomain(fullLink.before) ?? '',
			};
		}
		const h = rawHref ?? '';
		return {
			href: h,
			name: name ?? '',
			domain: explicitDomain ?? (h ? getDomain(h) : ''),
		};
	});

	let href = $derived(resolved.href);
	let displayName = $derived(shortName || resolved.name);
	let domain = $derived(resolved.domain);
	let brandColor = $derived(linkColors[resolved.name]);
</script>

<a
	{href}
	target="_blank"
	style={brandColor ? `--brand: ${brandColor}` : ''}
	class="link-box round-full inline-flex items-center px-2 py-1 text-sm no-underline
	 {domain ? 'gap-1.5' : 'gap-1'} 
	 {brandColor ? 'branded' : ''}"
>
	{#if domain}
		<Favicon {domain} name={resolved.name} />
	{:else}
		<Icon name="web" width="16" height="16" />
	{/if}
	<span>{displayName}</span>
</a>

<style>
	a.link-box.branded {
		background-color: rgba(var(--brand, 0, 0, 0), 0.12);
	}
	a.link-box.branded:hover {
		background-color: rgba(var(--brand, 0, 0, 0), 0.22);
	}
	:global(.dark) a.link-box.branded {
		background-color: rgba(var(--brand, 0, 0, 0), 0.2);
	}
	:global(.dark) a.link-box.branded:hover {
		background-color: rgba(var(--brand, 0, 0, 0), 0.3);
	}
</style>
