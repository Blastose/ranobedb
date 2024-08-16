<script lang="ts">
	import type { staffFilters } from '$lib/server/zod/schema';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import StaffFiltersInput from './StaffFiltersInput.svelte';

	export let filtersForm: SuperValidated<Infer<typeof staffFilters>>;

	const sForm = superForm(filtersForm, { dataType: 'json' });
</script>

<StaffFiltersInput form={sForm} />
