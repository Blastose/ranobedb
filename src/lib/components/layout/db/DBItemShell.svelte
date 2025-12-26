<script lang="ts">
	import type { DbItem } from '$lib/server/db/dbTypes';
	import type { User } from '$lib/server/lucia/lucia';
	import type { CopyTo, Rec } from '$lib/components/layout/db/VisibilityDisplay.svelte';
	import VisibilityDisplay from './VisibilityDisplay.svelte';
	import type { Nullish } from '$lib/server/zod/schema';
	import VisibilityDisplayPerm from './VisibilityDisplayPerm.svelte';

	interface Props {
		dbItem: DbItem;
		user: User | null;
		name: string;
		subName: Nullish<string>;
		revision: number | undefined;
		item: Rec;
		copyTo?: CopyTo | undefined;
		children?: import('svelte').Snippet;
	}

	let {
		dbItem,
		user,
		name,
		subName,
		revision,
		item,
		copyTo = undefined,
		children,
	}: Props = $props();
</script>

<section class="flex flex-col gap-2">
	<section>
		<p class="opacity-80 capitalize">{dbItem}</p>
		<div class="flex flex-col sm:flex-row gap-2 sm:gap-8 justify-between">
			<div class="flex flex-col">
				<h1 class="text-2xl font-bold">
					{name}
				</h1>
				{#if subName && subName !== name}
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
		{@render children?.()}
	</div>
</section>
