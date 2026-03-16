<script lang="ts">
	import { defaultUserListLabelsArray, defaultUserListLabelsColorMap } from '$lib/db/dbConsts';
	import { getDisplayPrefsContext } from '$lib/display/prefs';
	import LabelIcon from '../icon/LabelIcon.svelte';

	interface Props {
		badge: string;
		displayOverride?: 'full' | 'compact';
	}

	let { badge, displayOverride }: Props = $props();

	const displayPrefs = getDisplayPrefsContext();

	let display: 'full' | 'compact' = $derived(
		displayOverride ?? ($displayPrefs.label_badge_display ? 'full' : 'compact'),
	);
</script>

<div
	class="dark-main-text flex items-center gap-1 w-fit text-sm sm:text-base rounded-full
  {display === 'full' ? 'px-2' : 'p-1'}"
	style:background-color={defaultUserListLabelsArray.includes(badge as any)
		? `${defaultUserListLabelsColorMap[badge]}EA`
		: '#000000CA'}
>
	{#if defaultUserListLabelsArray.includes(badge as any)}
		<div class="label-icon">
			<LabelIcon label={badge} size={display === 'full' ? 'small' : 'mild'} />
		</div>
	{/if}
	{#if display === 'full'}
		<p>{badge}</p>
	{/if}
</div>

<style>
	.label-icon {
		display: none;
	}

	@container (min-width: 400px) {
		.label-icon {
			display: block;
		}
	}
</style>
