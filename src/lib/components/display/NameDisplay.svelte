<script lang="ts">
	import { getDisplayPrefsContext, getNameDisplay, type NameDisplay } from '$lib/display/prefs';

	export let obj: NameDisplay;
	export let fallback: string | undefined = undefined;

	const displayPrefs = getDisplayPrefsContext();

	$: nameDisplay = getNameDisplay({ obj, prefs: $displayPrefs.names });
</script>

{#if nameDisplay}
	{nameDisplay}
{:else}
	{fallback}
{/if}
