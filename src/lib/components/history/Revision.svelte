<script lang="ts">
	import type { Change } from '$lib/server/db/change/change';
	import RevisionInfo from './RevisionInfo.svelte';
	import type { Diff } from './utils';
	import Hr from '../layout/Hr.svelte';
	import DiffDisplay from './diff-display/DiffDisplay.svelte';

	interface Props {
		currentItemVisibility: { hidden: boolean; locked: boolean };
		changes: { prevChange?: Change; change: Change; nextChange?: Change };
		title: string;
		buildBaseLink: () => string;
		diffs: Diff[];
	}

	let { currentItemVisibility, changes, title, buildBaseLink, diffs }: Props = $props();
</script>

<div class="flex flex-col gap-2">
	<div>
		<p class="font-bold text-lg">Revision {changes.change.revision} of {title}</p>
		<div class="flex flex-wrap gap-4">
			<a class="link" href="{buildBaseLink()}/history">View history</a>
			<a class="link" href={buildBaseLink()}>View current</a>
			<a class="link" href="#content">Jump to content</a>
		</div>
	</div>

	{#if currentItemVisibility.hidden || currentItemVisibility.locked}
		<div>
			{#if currentItemVisibility.hidden}
				<p class="error-text-color">This item is currently hidden from view.</p>
			{/if}
			{#if currentItemVisibility.locked}
				<p class="error-text-color">This item is currently locked for editing.</p>
			{/if}
		</div>
	{/if}

	<div class="flex justify-between">
		{#if changes.prevChange}
			<a class="link" href="{buildBaseLink()}/revision/{changes.prevChange.revision}"
				>{'<-'} Previous revision</a
			>
		{:else}
			<div></div>
		{/if}
		{#if changes.nextChange}
			<a class="link" href="{buildBaseLink()}/revision/{changes.nextChange.revision}"
				>Next revision {'->'}</a
			>
		{/if}
	</div>

	{#if changes.change.revision !== 1}
		<div class="grid grid-cols-2">
			<RevisionInfo change={changes.prevChange} {buildBaseLink} isLatestRevision={false} />
			<RevisionInfo
				change={changes.change}
				{buildBaseLink}
				isLatestRevision={!Boolean(changes.nextChange)}
			/>
		</div>
	{:else}
		<RevisionInfo
			change={changes.change}
			{buildBaseLink}
			isLatestRevision={!Boolean(changes.nextChange)}
		/>
	{/if}

	{#if changes.change.revision !== 1}
		<section class="flex flex-col gap-2">
			<h2 class="font-bold text-lg">Changes:</h2>
			{#each diffs as d, index}
				<DiffDisplay changes={d} />
				{#if index !== diffs.length - 1}
					<Hr />
				{/if}
			{:else}
				<p class="italic">No changes</p>
			{/each}
		</section>
	{/if}
</div>
