<script lang="ts">
	import type { seriesFiltersObjSchema } from '$lib/server/zod/schema';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import type { TagType } from '$lib/server/db/dbTypes';
	import TagFilter from './TagFilter.svelte';
	import SeriesTagInput from './SeriesFiltersTagInput.svelte';
	import HiddenInput from '$lib/components/form/HiddenInput.svelte';

	export let filtersForm: SuperValidated<Infer<typeof seriesFiltersObjSchema>>;
	export let genres: { id: number; name: string; ttype: TagType; mode: 'incl' | 'excl' | 'none' }[];

	const sForm = superForm(filtersForm, { dataType: 'json' });

	function updateGenres() {
		genres = genres;
	}
</script>

<div class="flex flex-col gap-1">
	<h2>Genres</h2>
	<div class="flex flex-wrap gap-x-2 gap-y-2">
		{#each genres.filter((v) => v.ttype === 'genre') as value}
			{#if value.mode === 'incl'}
				<HiddenInput name="tagsInclude" value={String(value.id)} />
			{:else if value.mode === 'excl'}
				<HiddenInput name="tagsExclude" value={String(value.id)} />
			{/if}
		{/each}

		{#each genres as genre}
			<TagFilter handleUpdate={updateGenres} {genre} removable={false} />
		{/each}
	</div>
</div>

<SeriesTagInput form={sForm} />
