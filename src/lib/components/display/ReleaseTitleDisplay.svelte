<script lang="ts">
	import {
		getDisplayPrefsContext,
		getReleaseTitleDisplay,
		getReleaseTitleDisplaySub,
		type ReleaseTitle,
	} from '$lib/display/prefs';

	interface Props {
		obj: ReleaseTitle;
		fallback?: string | undefined;
		type?: 'main' | 'sub';
	}

	let { obj, fallback = undefined, type = 'main' }: Props = $props();

	const displayPrefs = getDisplayPrefsContext();

	let nameDisplay = $derived(
		type === 'main'
			? getReleaseTitleDisplay({ obj, prefs: $displayPrefs })
			: getReleaseTitleDisplaySub({ obj, prefs: $displayPrefs }),
	);
</script>

{#if nameDisplay}
	{nameDisplay}
{:else if fallback}
	{fallback}
{/if}
