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
		size?: 'large' | 'small';
	}

	let { obj, fallback = undefined, type = 'main', size = 'large' }: Props = $props();

	const displayPrefs = getDisplayPrefsContext();

	let nameDisplay = $derived(
		type === 'main'
			? getNameDisplay({ obj, prefs: $displayPrefs.names })
			: getNameDisplaySub({ obj, prefs: $displayPrefs.names }),
	);
	let nameDisplaySub = $derived(
		type === 'sub'
			? getNameDisplay({ obj, prefs: $displayPrefs.names })
			: getNameDisplaySub({ obj, prefs: $displayPrefs.names }),
	);
</script>

{#if nameDisplay}
	{nameDisplay}{#if nameDisplaySub}<span
			class="{size === 'large' ? 'text-sm' : 'text-xs'} sub-text-alt"
			>{size === 'large' ? '　' : ' '}{nameDisplaySub}</span
		>{/if}
{:else if fallback}
	{fallback}
{/if}
