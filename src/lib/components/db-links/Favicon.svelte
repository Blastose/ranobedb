<script lang="ts">
	import { faviconUrl, faviconDomains } from './db-ext-links';

	interface Props {
		domain: string;
		name?: string;
	}

	let { domain, name }: Props = $props();

	function getFaviconDomain(domain: string, name?: string): string {
		if (name) {
			return faviconDomains[name] ?? domain;
		}
		return domain;
	}

	let src = $derived(faviconUrl(getFaviconDomain(domain, name)));
</script>

<img {src} width="16" height="16" alt="" class="h-4 w-4 shrink-0 object-contain" loading="lazy" />
