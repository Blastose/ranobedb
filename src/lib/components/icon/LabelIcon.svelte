<script lang="ts">
	import type { defaultUserListLabelsArray } from '$lib/db/dbConsts';
	import Icon, { type IconType } from './Icon.svelte';

	interface Props {
		label: string | undefined;
		size?: 'normal' | 'small';
	}

	let { label, size = 'normal' }: Props = $props();

	const width = size === 'normal' ? '24' : '16';
	const height = size === 'normal' ? '24' : '16';

	const labelToIconMap: Record<string | (typeof defaultUserListLabelsArray)[number], IconType> = {
		Reading: 'book',
		Finished: 'checkCircleOutline',
		'Plan to read': 'bookmark',
		Stalled: 'pauseBoxOutline',
		Dropped: 'stopCircleOutline',
		Other: 'folderOutline',
	};

	let iconName = $derived.by(() => {
		if (!label) {
			return null;
		}
		return labelToIconMap[label];
	});
</script>

{#if iconName}
	<!-- It doesn't update the icon without this key for some reason -->
	{#key iconName}
		<Icon name={iconName} {width} {height} />
	{/key}
{/if}
