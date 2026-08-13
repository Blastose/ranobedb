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
		<p class="capitalize opacity-80">{dbItem}</p>
		<div class="flex flex-col justify-between gap-2 sm:flex-row sm:gap-8">
			<div class="flex flex-col">
				<h1 class="text-2xl font-bold">
					{name}
				</h1>
				{#if subName && subName !== name}
					<p class="opacity-75">{subName}</p>
				{/if}
			</div>

			<section class="mt-1 w-min whitespace-nowrap">
				<VisibilityDisplay {item} type={dbItem} {user} {copyTo} {revision} />
			</section>
		</div>
	</section>

	<VisibilityDisplayPerm {item} {user} />

	<div class="mt-2 flex flex-col gap-2">
		{@render children?.()}
	</div>
</section>
