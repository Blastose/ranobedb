<script lang="ts">
	import type { Change } from '$lib/server/db/change/change';
	import RevisionInfo from './RevisionInfo.svelte';

	export let changes: { prevChange?: Change; change: Change; nextChange?: Change };
	export let title: string;
	export let buildBaseLink: () => string;
	export let diff: string;
</script>

<div class="flex flex-col gap-2">
	<div>
		<p class="font-bold text-lg">Revision {changes.change.revision} of {title}</p>
		<div class="flex gap-4">
			<a class="link" href="{buildBaseLink()}/history">View history</a><a
				class="link"
				href={buildBaseLink()}>View current</a
			>
		</div>
	</div>

	{#if (changes.change.ihid || changes.change.ilock) && !changes.nextChange}
		<div>
			{#if changes.change.ihid}
				<p class="error-text-color">This item is currently hidden from view.</p>
			{/if}
			{#if changes.change.ilock}
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
			<div />
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

	{#if diff}
		<section>
			<h2>Changes:</h2>
			<code class="whitespace-pre-line">{diff}</code>
		</section>
	{/if}
</div>
