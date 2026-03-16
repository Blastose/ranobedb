<script lang="ts">
	import { defaultUserListLabelsArray, defaultUserListLabelsColorMap } from '$lib/db/dbConsts';
	import { getDisplayPrefsContext } from '$lib/display/prefs';
	import LabelIcon from '../icon/LabelIcon.svelte';
	import ReadingListBadge from './ReadingListBadge.svelte';

	interface Props {
		badges: string[];
		location?: 'top-right' | 'bottom-right';
	}

	const displayPrefs = getDisplayPrefsContext();

	let { badges, location = 'top-right' }: Props = $props();
</script>

<div
	class="absolute flex flex-col gap-1 p-1 sm:p-2 items-end {location === 'top-right'
		? 'top-0 right-0'
		: 'bottom-0 right-0'}"
>
	{#each badges as badge}
		{#if badge !== ''}
			{#if defaultUserListLabelsArray.includes(badge as any)}
				<ReadingListBadge {badge} />
			{:else}
				<div
					class="dark-main-text w-fit text-sm sm:text-base rounded-full px-2 flex items-center gap-1 drop-shadow-md"
					style:background-color="#000000BF"
				>
					{#if badge.startsWith('Score: ') && !$displayPrefs.label_badge_display}
						<p>{badge.replace('Score: ', '').trim()}</p>
					{:else}
						<p>{badge}</p>
					{/if}
				</div>
			{/if}
		{/if}
	{/each}
</div>
