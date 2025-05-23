<script lang="ts">
	import {
		getDisplayPrefsContext,
		getTitleDisplay,
		getTitleDisplaySub,
		type TitleDisplayFull,
	} from '$lib/display/prefs';

	interface Props {
		obj: TitleDisplayFull;
		fallback?: string | undefined;
		type?: 'main' | 'sub';
	}

	let { obj, fallback = undefined, type = 'main' }: Props = $props();

	const displayPrefs = getDisplayPrefsContext();

	let titleDisplay = $derived(
		type === 'main'
			? getTitleDisplay({ obj, prefs: $displayPrefs.title_prefs })
			: getTitleDisplaySub({ obj, prefs: $displayPrefs.title_prefs }),
	);
</script>

<span title={titleDisplay || fallback}>
	{#if titleDisplay}
		{titleDisplay}
	{:else if fallback}
		{fallback}
	{/if}
</span>
