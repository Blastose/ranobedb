<script lang="ts">
	import { logicalOps } from '$lib/db/dbConsts';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import SelectField from '../SelectField.svelte';
	import PublisherFilters from './publisher/PublisherFilters.svelte';
	import StaffFilters from './staff/StaffFilters.svelte';
	import type { staffPublisherFilters } from '$lib/server/zod/schema';

	export let filtersForm: SuperValidated<Infer<typeof staffPublisherFilters>>;
	const sForm = superForm(filtersForm, { dataType: 'json' });
</script>

<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
	<StaffFilters {filtersForm} />
	<SelectField
		form={sForm}
		field="sl"
		dropdownOptions={logicalOps.map((v) => ({ display: v, value: v }))}
		selectedValue={filtersForm.data.sl}
		label="Book staff filter logic"
		resetPadding={true}
		showRequiredSymbolIfRequired={false}
		fit={true}
	/>

	<PublisherFilters {filtersForm} />
	<SelectField
		form={sForm}
		field="pl"
		dropdownOptions={logicalOps.map((v) => ({ display: v, value: v }))}
		selectedValue={filtersForm.data.pl}
		label="Release publisher filter logic"
		resetPadding={true}
		showRequiredSymbolIfRequired={false}
		fit={true}
	/>
</div>
