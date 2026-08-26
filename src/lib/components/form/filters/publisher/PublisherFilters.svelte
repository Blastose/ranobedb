<script lang="ts">
	import type { publisherFilters } from '$lib/server/zod/schema';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import PublisherFiltersInput from './PublisherFiltersInput.svelte';

	interface Props {
		filtersForm: SuperValidated<Infer<typeof publisherFilters>>;
	}

	let { filtersForm }: Props = $props();

	// svelte-ignore state_referenced_locally
	const sForm = superForm(filtersForm, { dataType: 'json' });
</script>

<PublisherFiltersInput form={sForm} />
