<script lang="ts">
	import {
		getDisplayPrefsContext,
		getTitleDisplay,
		getTitleDisplaySub,
		type TitleDisplayFull,
	} from '$lib/display/prefs';

	export let obj: TitleDisplayFull;
	export let fallback: string | undefined = undefined;
	export let type: 'main' | 'sub' = 'main';

	const displayPrefs = getDisplayPrefsContext();

	$: titleDisplay =
		type === 'main'
			? getTitleDisplay({ obj, prefs: $displayPrefs.title_prefs })
			: getTitleDisplaySub({ obj, prefs: $displayPrefs.title_prefs });
</script>

{#if titleDisplay}
	{titleDisplay}
{:else if fallback}
	{fallback}
{/if}
