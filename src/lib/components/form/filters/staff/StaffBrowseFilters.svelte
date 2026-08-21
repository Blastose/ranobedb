<script lang="ts">
	import type { staffFiltersObjSchema } from '$lib/server/zod/schema';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { languageNames, languagesArray, staffSortArray } from '$lib/db/dbConsts';
	import Keyed from '../../Keyed.svelte';
	import SelectField from '../../SelectField.svelte';
	import MultiSelectField from '../../MultiSelectField.svelte';
	import FiltersWrapper from '$lib/components/form/filters/FiltersWrapper.svelte';

	export let filtersForm: SuperValidated<Infer<typeof staffFiltersObjSchema>>;
	const sForm = superForm(filtersForm, { dataType: 'json' });
</script>

<FiltersWrapper>
	<div class="flex flex-col gap-4">
		<div class="flex w-fit flex-wrap gap-x-4 gap-y-2">
			<Keyed>
				<MultiSelectField
					form={sForm}
					field="lang"
					noneSelectedText="any"
					allSelectedText="any"
					labelText="Staff language"
					dropdownOptions={languagesArray.map((v) => ({ display: languageNames[v], value: v }))}
				/>
			</Keyed>

			<SelectField
				form={sForm}
				field="sort"
				dropdownOptions={staffSortArray.map((v) => ({ display: v, value: v }))}
				selectedValue={filtersForm.data.sort}
				label="Sort by"
				resetPadding={true}
				showRequiredSymbolIfRequired={false}
				fit={true}
			/>
		</div>
	</div>
</FiltersWrapper>
