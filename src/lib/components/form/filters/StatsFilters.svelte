<script lang="ts">
	import type { statsFiltersSchema } from '$lib/server/zod/schema';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { defaultUserListLabels, statsFiltersSortArray } from '$lib/db/dbConsts';
	import FiltersWrapper from './FiltersWrapper.svelte';
	import Keyed from '../Keyed.svelte';
	import MultiSelectField from '../MultiSelectField.svelte';
	import SelectField from '../SelectField.svelte';
	import CheckboxField from '../CheckboxField.svelte';
	import SubmitButton from '../SubmitButton.svelte';
	import { page } from '$app/state';

	export let filtersForm: SuperValidated<Infer<typeof statsFiltersSchema>>;
	const sForm = superForm(filtersForm, { dataType: 'json' });
</script>

<form method="get">
	<FiltersWrapper>
		<div class="flex flex-col gap-4">
			<div class="w-fit flex flex-wrap items-center gap-x-4 gap-y-2">
				<Keyed>
					<MultiSelectField
						form={sForm}
						field="reading_status"
						noneSelectedText="any"
						allSelectedText="any"
						labelText="Reading status"
						dropdownOptions={defaultUserListLabels.map((v) => ({
							display: v.label,
							value: v.id,
						}))}
					/>
				</Keyed>

				<SelectField
					form={sForm}
					field="sort"
					dropdownOptions={statsFiltersSortArray.map((v) => ({ display: v, value: v }))}
					selectedValue={filtersForm.data.sort}
					label="Sort by"
					resetPadding={true}
					showRequiredSymbolIfRequired={false}
					fit={true}
				/>

				<CheckboxField
					form={sForm}
					field="has_score"
					label="Has score"
					showRequiredSymbolIfRequired={false}
				/>
			</div>
			<div class="w-fit whitespace-nowrap">
				<div class="flex gap-4">
					<SubmitButton text="Filter" delayed={false} submitting={false} />
					<div class="flex">
						<a class="tet-btn" href={page.url.toString().replace(page.url.search, '')}
							>Reset filters</a
						>
					</div>
				</div>
			</div>
		</div>
	</FiltersWrapper>
</form>
