<script lang="ts">
	import { defaultUserListLabelsArray } from '$lib/db/dbConsts';
	import { getDisplayPrefsContext } from '$lib/display/prefs';
	import Icon from '../icon/Icon.svelte';
	import ReadingListBadge from './ReadingListBadge.svelte';

	interface Props {
		badges: string[];
		location?: 'top-right' | 'bottom-right';
	}

	const displayPrefs = getDisplayPrefsContext();

	let { badges, location = 'top-right' }: Props = $props();

	// TODO - This is pretty hacky, but it combines the score and reading list label icon for those with display prefs set to that
	let score = $derived.by(() => {
		for (const badge of badges) {
			if (badge.startsWith('Score:') && !$displayPrefs.label_badge_display) {
				return badge.replace('Score: ', '');
			}
		}

		return undefined;
	});
</script>

<div
	class="absolute flex flex-col items-end gap-1 p-1 sm:p-[0.375rem] {location === 'top-right'
		? 'right-0 top-0'
		: 'bottom-0 right-0'}"
>
	{#each badges as badge}
		{#if badge !== ''}
			{#if defaultUserListLabelsArray.includes(badge as any)}
				<ReadingListBadge {badge} {score} />
			{:else if !(badge.startsWith('Score: ') && !$displayPrefs.label_badge_display)}
				<div
					class="dark-main-text flex w-fit items-center gap-1 rounded-full px-2 text-sm shadow-md sm:text-base"
					style:background-color="#000000BF"
				>
					{#if badge.startsWith('Score: ')}
						<p>{'Score: '}</p>
						<Icon name="star" height="18" width="18" />
						<p>{badge.replace('Score: ', '')}</p>
					{:else if badge.endsWith('vols.') && !$displayPrefs.label_badge_display}
						<p class="text-sm">{badge.replace(' vols.', '').trim()}</p>
						<Icon name="bookshelf" height="18" width="18" />
					{:else}
						<p>{badge}</p>
					{/if}
				</div>
			{/if}
		{/if}
	{/each}
</div>
