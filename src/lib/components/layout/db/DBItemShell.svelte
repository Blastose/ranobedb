<script lang="ts">
	import type { DbItem } from '$lib/server/db/dbTypes';
	import type { User } from '$lib/server/lucia/lucia';
	import type { CopyTo, Rec } from '$lib/components/layout/db/VisibilityDisplay.svelte';
	import VisibilityDisplay from './VisibilityDisplay.svelte';
	import type { Nullish } from '$lib/server/zod/schema';
	import VisibilityDisplayPerm from './VisibilityDisplayPerm.svelte';

	export let dbItem: DbItem;
	export let user: User | null;
	export let name: string;
	export let subName: Nullish<string>;
	export let revision: number | undefined;
	export let item: Rec;
	export let copyTo: CopyTo | undefined = undefined;
</script>

<section class="flex flex-col gap-2">
	<section>
		<p class="opacity-80 capitalize">{dbItem}</p>
		<div class="flex flex-col sm:flex-row gap-2 sm:gap-8 justify-between">
			<div class="flex flex-col">
				<h1 class="text-2xl font-bold">
					{name}
				</h1>
				{#if subName}
					<p class="opacity-75">{subName}</p>
				{/if}
			</div>

			<section class="whitespace-nowrap w-min mt-1">
				<VisibilityDisplay {item} type={dbItem} {user} {copyTo} {revision} />
			</section>
		</div>
	</section>

	<VisibilityDisplayPerm {item} {user} />

	<div class="mt-2 flex flex-col gap-2">
		<slot />
	</div>
</section>
