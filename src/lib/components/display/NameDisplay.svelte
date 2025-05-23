<script lang="ts">
	import {
		getDisplayPrefsContext,
		getNameDisplay,
		getNameDisplaySub,
		type NameDisplay,
	} from '$lib/display/prefs';

	interface Props {
		obj: NameDisplay;
		fallback?: string | undefined;
		type?: 'main' | 'sub';
	}

	let { obj, fallback = undefined, type = 'main' }: Props = $props();

	const displayPrefs = getDisplayPrefsContext();

	let nameDisplay = $derived(
		type === 'main'
			? getNameDisplay({ obj, prefs: $displayPrefs.names })
			: getNameDisplaySub({ obj, prefs: $displayPrefs.names }),
	);
</script>

{#if nameDisplay}
	{nameDisplay}
{:else if fallback}
	{fallback}
{/if}
