<script lang="ts">
	import { defaultUserListLabelsArray, defaultUserListLabelsColorMap } from '$lib/db/dbConsts';
	import { getDisplayPrefsContext } from '$lib/display/prefs';
	import Icon from '../icon/Icon.svelte';
	import LabelIcon from '../icon/LabelIcon.svelte';

	interface Props {
		badge: string;
		score?: string;
		displayOverride?: 'full' | 'compact';
	}

	let { badge, score, displayOverride }: Props = $props();

	const displayPrefs = getDisplayPrefsContext();

	let display: 'full' | 'compact' = $derived(
		displayOverride ?? ($displayPrefs.label_badge_display ? 'full' : 'compact'),
	);
</script>

<div
	class="shadow-md dark-main-text flex items-center gap-1 w-fit text-sm sm:text-base rounded-full
  {display === 'full' ? 'px-2' : score ? 'py-1 pl-1 pr-2' : 'p-1'}"
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
	{#if score}
		<Icon name={'star'} width="18" height="18" />
		<p class="text-sm">{score}</p>
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
