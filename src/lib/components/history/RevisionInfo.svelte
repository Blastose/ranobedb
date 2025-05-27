<script lang="ts">
	import type { Change } from '$lib/server/db/change/change';
	import MarkdownToHtml from '$lib/components/markdown/MarkdownToHtml.svelte';

	interface Props {
		change: Change | undefined;
		buildBaseLink: () => string;
		isLatestRevision: boolean;
	}

	let { change, buildBaseLink, isLatestRevision }: Props = $props();

	let revisionEditText = $derived(isLatestRevision ? 'edit' : 'revert to');
	let revisionEditLink = $derived(
		isLatestRevision
			? `${buildBaseLink()}/edit`
			: `${buildBaseLink()}/edit?revision=${change?.revision}`,
	);
</script>

{#if change}
	<section class="flex flex-col text-center items-center">
		<h2 class="font-semibold">
			Revision {change.revision} (<a class="link font-normal" href={revisionEditLink}
				>{revisionEditText}</a
			>)
		</h2>

		<p>
			By <a class="link" href="/user/{change.id_numeric}">{change.username}</a> on {new Date(
				change.added ?? 0,
			).toLocaleString()}
		</p>
		<MarkdownToHtml markdown={change.comments} type="full" />
	</section>
{/if}
