<script lang="ts">
	import type { Change } from '$lib/server/db/change/change';

	export let change: Change | undefined;
	export let buildBaseLink: () => string;
</script>

{#if change}
	<section class="flex flex-col items-center">
		<h2 class="font-semibold">
			Revision {change.revision} (<a
				class="link font-normal"
				href="{buildBaseLink()}/edit?revision={change.revision}">revert to</a
			>)
		</h2>

		<p>
			By <a class="link" href="/user/{change.username}">{change.username}</a> on {new Date(
				change.added ?? 0
			).toLocaleString()}
		</p>
		<p>({change.comments})</p>
	</section>
{/if}
