<script lang="ts">
	import { languageCountryCode } from '$lib/db/dbConsts';
	import type { Language } from '$lib/server/db/dbTypes';
	import { flagUrl } from '$lib/components/db-links/db-ext-links';

	interface Props {
		lang: Language;
		opacity?: number;
	}

	let { lang, opacity = 0.85 }: Props = $props();

	const code = $derived(languageCountryCode[lang]);
</script>

{#if code}
	<div class="flex items-center justify-center">
		<img
			class="h-4 w-6 rounded-sm object-cover"
			style:opacity
			src={flagUrl(code)}
			alt={lang}
			loading="lazy"
		/>
	</div>
{/if}
