<script lang="ts">
	import StatsFilters from '$lib/components/form/filters/StatsFilters.svelte';
	import Icon from '$lib/components/icon/Icon.svelte';
	import Hr from '$lib/components/layout/Hr.svelte';
	import PaginationContainer from '$lib/components/pagination/PaginationContainer.svelte';
	import { defaultUserListLabelsArray } from '$lib/db/dbConsts.js';
	import type { statsFiltersSchema } from '$lib/server/zod/schema';
	import { relativeTime } from '$lib/utils/relative-time.js';
	import type { SuperValidated, Infer } from 'sveltekit-superforms';
	import { buildAvatarImageUrl } from '../book/book';

	interface Props {
		type: 'book' | 'series';
		id: number;
		form: SuperValidated<Infer<typeof statsFiltersSchema>>;
		currentPage: number;
		totalPages: number;
		stats: {
			last_updated: Date;
			username: string;
			id_numeric: number;
			label_id: number;
			filename: string | null;
			score: unknown;
		}[];
		title: string;
	}

	let { type, id, form, currentPage, totalPages, stats, title }: Props = $props();
</script>

<div class="flex flex-col gap-4">
	<div>
		<h1 class="text-2xl font-bold">{title}</h1>
		<div>
			<a class="link" href="/{type}/{id}">View main {type} page</a>
		</div>
	</div>

	<StatsFilters filtersForm={form} />

	<PaginationContainer {currentPage} {totalPages} showTopPages={false} results={undefined}>
		<div class="flex flex-col gap-4">
			{#each stats as change, index}
				<div class="flex justify-between">
					<div class="flex gap-2">
						<a
							class="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[var(--primary-500)] font-bold text-white"
							href="/user/{change.id_numeric}"
						>
							{#if change.filename}
								{#key change.filename}
									<img src={buildAvatarImageUrl(change.filename)} alt="" />
								{/key}
							{:else}
								{change.username.at(0)}
							{/if}
						</a>

						<div class="flex flex-col gap-1">
							<p>
								<a class="link" href="/user/{change.id_numeric}">{change.username}</a>
							</p>
							<div class="grid grid-cols-[96px_1fr] gap-2">
								<p class="flex w-fit items-center rounded-lg border px-2 text-sm">
									{defaultUserListLabelsArray.at(change.label_id - 1)}
								</p>
								{#if change.score}
									<p class="flex items-center gap-1">
										<Icon
											class="text-[#ffa844]"
											name="star"
											height="18"
											width="18"
										/>{change.score ?? '-'}
									</p>
								{/if}
							</div>
						</div>
					</div>
					<div>
						<p class="sub-text-alt text-sm" title={change.last_updated.toLocaleString()}>
							{relativeTime(change.last_updated.getTime() / 1000, true)}
						</p>
					</div>
				</div>
				{#if index < stats.length - 1}
					<Hr />
				{/if}
			{/each}
		</div>
	</PaginationContainer>
</div>
