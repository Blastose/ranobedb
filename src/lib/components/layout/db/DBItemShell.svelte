<script lang="ts">
	import type { DbItem } from '$lib/server/db/dbTypes';
	import type { User } from 'lucia';
	import type { Rec } from '$lib/components/layout/db/VisibilityDisplay.svelte';
	import VisibilityDisplay from './VisibilityDisplay.svelte';
	import type { Nullish } from '$lib/zod/schema';
	import VisibilityDisplayPerm from './VisibilityDisplayPerm.svelte';

	export let dbItem: DbItem;
	export let user: User | null;
	export let name: string;
	export let subName: Nullish<string>;
	export let isRevision: boolean;
	export let item: Rec;
</script>

<section class="flex flex-col gap-2">
	<section>
		<p class="opacity-80 capitalize">{dbItem}</p>
		<div class="flex gap-2 sm:gap-8 justify-between">
			<div class="flex flex-col">
				<h1 class="text-2xl font-bold">
					{name}
				</h1>
				{#if subName}
					<p class="opacity-75">{subName}</p>
				{/if}
			</div>

			{#if !isRevision}
				<section class="whitespace-nowrap w-min mt-1">
					<VisibilityDisplay {item} type={dbItem} {user} />
				</section>
			{/if}
		</div>
	</section>

	<section>
		<VisibilityDisplayPerm {item} {user} />
	</section>

	<slot />
</section>
