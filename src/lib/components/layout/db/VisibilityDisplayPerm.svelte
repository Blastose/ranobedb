<script lang="ts" context="module">
	type Rec = { hidden: boolean; locked: boolean };
</script>

<script lang="ts" generics="T extends Rec">
	import { hasVisibilityPerms } from '$lib/db/permissions';
	import type { User } from '$lib/server/lucia/lucia';

	export let item: T;
	export let user: User | null;
</script>

{#if hasVisibilityPerms(user) && (item.locked || item.hidden)}
	<div class="flex flex-col mt-2">
		{#if hasVisibilityPerms(user)}
			{#if item.locked}
				<p>
					This item is currently <span class="error-text-color">locked</span>
				</p>
			{/if}
			{#if item.hidden}
				<p>
					This item is currently <span class="error-text-color">hidden</span>
				</p>
			{/if}
		{/if}
	</div>
{/if}
