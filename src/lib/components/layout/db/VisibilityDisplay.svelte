<script lang="ts" context="module">
	export type Rec = { hidden: boolean; locked: boolean; id: number };
</script>

<script lang="ts" generics="T extends Rec">
	import Icon from '$lib/components/icon/Icon.svelte';

	import type { DbItem } from '$lib/server/db/dbTypes';
	import { hasVisibilityPerms } from '$lib/db/permissions';
	import type { User } from 'lucia';

	export let item: T;
	export let type: DbItem;
	export let user: User | null;
</script>

<div class="flex flex-wrap sm:flex-nowrap gap-2">
	{#if item.locked && !hasVisibilityPerms(user)}
		<p class="sub-btn loading w-fit flex items-center gap-2">
			<Icon name="lock" height="16" width="16" />Locked
		</p>
	{:else}
		<a class="sub-btn w-fit flex items-center gap-2" href="/{type}/{item.id}/edit"
			><Icon name="pencil" height="16" width="16" />Edit</a
		>
	{/if}
	<a class="sub-btn w-fit flex items-center gap-2" href="/{type}/{item.id}/history">
		<Icon name="history" height="16" width="16" />History</a
	>
</div>
