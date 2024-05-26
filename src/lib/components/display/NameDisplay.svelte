<script lang="ts">
	import {
		getDisplayPrefsContext,
		getNameDisplay,
		getNameDisplaySub,
		type NameDisplay,
	} from '$lib/display/prefs';

	export let obj: NameDisplay;
	export let fallback: string | undefined = undefined;
	export let type: 'main' | 'sub' = 'main';

	const displayPrefs = getDisplayPrefsContext();

	$: nameDisplay =
		type === 'main'
			? getNameDisplay({ obj, prefs: $displayPrefs.names })
			: getNameDisplaySub({ obj, prefs: $displayPrefs.names });
</script>

{#if nameDisplay}
	{nameDisplay}
{:else if fallback}
	{fallback}
{/if}
