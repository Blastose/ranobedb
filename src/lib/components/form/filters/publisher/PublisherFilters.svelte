<script lang="ts">
	import type { publisherFilters } from '$lib/server/zod/schema';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
 	import PublisherFiltersInput from './PublisherFiltersInput.svelte';

	export let filtersForm: SuperValidated<Infer<typeof publisherFilters>>;

	const sForm = superForm(filtersForm, { dataType: 'json' });
</script>

<PublisherFiltersInput form={sForm} />
