<script lang="ts">
	import type { historyFiltersSchema } from '$lib/server/zod/schema';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import SubmitButton from '../SubmitButton.svelte';
	import SelectField from '../SelectField.svelte';
	import { dbItemArray, historyFilterChangeType, historyFilterVisibilitys } from '$lib/db/dbConsts';
	import CheckboxField from '../CheckboxField.svelte';
	import Keyed from '../Keyed.svelte';
	import MultiSelectField from '../MultiSelectField.svelte';

	export let filtersForm: SuperValidated<Infer<typeof historyFiltersSchema>>;
	const sForm = superForm(filtersForm, {
		dataType: 'json',
		resetForm: false,
	});
	const { form, enhance, delayed, submitting } = sForm;
</script>

<form method="get" class="flex flex-col">
	<h2 class="text-lg font-bold">Filters</h2>

	<div class="flex flex-col gap-4">
		<div class="w-fit flex flex-wrap gap-x-8 gap-y-2 items-end">
			<Keyed>
				<MultiSelectField
					form={sForm}
					field="items"
					allSelectedText="All"
					labelText="Items"
					dropdownOptions={dbItemArray.map((v) => ({ display: v, value: v }))}
				/>
			</Keyed>

			<SelectField
				form={sForm}
				field="change_type"
				dropdownOptions={historyFilterChangeType.map((item) => ({
					display: item,
					value: item,
				}))}
				selectedValue={filtersForm.data.change_type}
				label="Change type"
				showRequiredSymbolIfRequired={false}
				resetPadding={true}
			/>

			<SelectField
				form={sForm}
				field="visibility"
				dropdownOptions={historyFilterVisibilitys.map((item) => ({
					display: item,
					value: item,
				}))}
				selectedValue={filtersForm.data.visibility}
				label="Item visibility"
				showRequiredSymbolIfRequired={false}
				resetPadding={true}
			/>

			<CheckboxField
				form={sForm}
				field="hide_automated"
				label="Hide automated changes"
				showRequiredSymbolIfRequired={false}
			/>
		</div>

		<div class="max-w-32">
			<SubmitButton delayed={$delayed} submitting={$submitting} text="Filter" />
		</div>
	</div>
</form>
