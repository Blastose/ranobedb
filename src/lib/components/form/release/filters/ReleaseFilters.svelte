<script lang="ts">
	import type { releaseFiltersSchema } from '$lib/server/zod/schema';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import {
		languageNames,
		languagesArray,
		releaseFormatArray,
		releaseSortArray,
	} from '$lib/db/dbConsts';
	import Keyed from '../../Keyed.svelte';
	import SelectField from '../../SelectField.svelte';
	import MultiSelectField from '../../MultiSelectField.svelte';
	import FiltersWrapper from '$lib/components/form/filters/FiltersWrapper.svelte';

	export let filtersForm: SuperValidated<Infer<typeof releaseFiltersSchema>>;
	export let showSort: boolean = true;
	const sForm = superForm(filtersForm);
</script>

<FiltersWrapper>
	<div class="flex flex-col gap-2">
		<div class="w-fit flex flex-wrap gap-x-4 gap-y-2">
			<Keyed>
				<MultiSelectField
					form={sForm}
					field="rl"
					allSelectedText={'any'}
					labelText="Release language"
					dropdownOptions={languagesArray.map((v) => ({ display: languageNames[v], value: v }))}
				/>
			</Keyed>

			<Keyed>
				<MultiSelectField
					form={sForm}
					field="rf"
					allSelectedText={'any'}
					labelText="Release format"
					dropdownOptions={releaseFormatArray.map((v) => ({ display: v, value: v }))}
				/>
			</Keyed>

			{#if showSort}
				<SelectField
					form={sForm}
					field="sort"
					dropdownOptions={releaseSortArray.map((v) => ({ display: v, value: v }))}
					selectedValue={filtersForm.data.sort}
					label="Sort by"
					resetPadding={true}
					showRequiredSymbolIfRequired={false}
					fit={true}
				/>
			{/if}
		</div>

		<slot />
	</div>
</FiltersWrapper>
