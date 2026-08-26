<script lang="ts">
	import type { staffFilters } from '$lib/server/zod/schema';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import StaffFiltersInput from './StaffFiltersInput.svelte';

	interface Props {
		filtersForm: SuperValidated<Infer<typeof staffFilters>>;
	}

	let { filtersForm }: Props = $props();

	// svelte-ignore state_referenced_locally
	const sForm = superForm(filtersForm, { dataType: 'json' });
</script>

<StaffFiltersInput form={sForm} />
