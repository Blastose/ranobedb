<script lang="ts">
	import LangFlag from '$lib/components/titles/LangFlag.svelte';
	import NameDisplay from '$lib/components/display/NameDisplay.svelte';
	import type { Language } from '$lib/server/db/dbTypes';
	import type { NameDisplay as NameDisplayType } from '$lib/display/prefs';

	interface Props {
		lang: Language;
		obj: NameDisplayType;
	}

	let { lang, obj }: Props = $props();
</script>

<div class="grid grid-cols-[24px_1fr] items-center gap-2">
	<LangFlag {lang} />
	<p class="min-w-0 truncate">
		<NameDisplay {obj} />
	</p>
</div>
