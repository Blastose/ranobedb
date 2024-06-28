<script lang="ts">
	import type { bookFiltersSchema } from '$lib/server/zod/schema';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { languageNames, languagesArray, logicalOps, releaseFormatArray } from '$lib/db/dbConsts';
	import Keyed from '../../Keyed.svelte';
	import SelectField from '../../SelectField.svelte';
	import MultiSelectField from '../../MultiSelectField.svelte';
	import { getAllOrAny } from '../../filters/utils';

	export let filtersForm: SuperValidated<Infer<typeof bookFiltersSchema>>;
	const sForm = superForm(filtersForm, {
		resetForm: false,
	});
	const { form, enhance, delayed, submitting } = sForm;
</script>

<section>
	<h2 class="text-lg font-bold">Filters</h2>

	<div class="flex flex-col gap-4">
		<div class="w-fit flex flex-wrap gap-2">
			<Keyed>
				<MultiSelectField
					form={sForm}
					field="rl"
					allSelectedText={getAllOrAny($form.rll)}
					labelText="Release language"
					dropdownOptions={languagesArray.map((v) => ({ display: languageNames[v], value: v }))}
				/>
			</Keyed>

			<div class="w-fit">
				<SelectField
					form={sForm}
					field="rll"
					dropdownOptions={logicalOps.map((v) => ({ display: v, value: v }))}
					selectedValue={filtersForm.data.rll}
					label="Release langauge filter logic"
					resetPadding={true}
					showRequiredSymbolIfRequired={false}
				/>
			</div>
		</div>
		<div class="w-fit flex flex-wrap gap-2">
			<Keyed>
				<MultiSelectField
					form={sForm}
					field="rf"
					allSelectedText={getAllOrAny($form.rfl)}
					labelText="Release format"
					dropdownOptions={releaseFormatArray.map((v) => ({ display: v, value: v }))}
				/>
			</Keyed>

			<div class="w-fit">
				<SelectField
					form={sForm}
					field="rfl"
					dropdownOptions={logicalOps.map((v) => ({ display: v, value: v }))}
					selectedValue={filtersForm.data.rfl}
					label="Release langauge filter logic"
					resetPadding={true}
					showRequiredSymbolIfRequired={false}
				/>
			</div>
		</div>
	</div>
</section>
