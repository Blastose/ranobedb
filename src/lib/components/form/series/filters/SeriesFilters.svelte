<script lang="ts">
	import type { seriesFiltersObjSchema } from '$lib/server/zod/schema';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import {
		languageNames,
		languagesArray,
		logicalOps,
		releaseFormatArray,
		seriesSortArray,
	} from '$lib/db/dbConsts';
	import Keyed from '../../Keyed.svelte';
	import SelectField from '../../SelectField.svelte';
	import MultiSelectField from '../../MultiSelectField.svelte';
	import { getAllOrAny } from '../../filters/utils';
	import TagsFilters from './tags/TagsFilters.svelte';
	import type { TagType } from '$lib/server/db/dbTypes';
	import FiltersWrapper from '$lib/components/form/filters/FiltersWrapper.svelte';

	export let filtersForm: SuperValidated<Infer<typeof seriesFiltersObjSchema>>;
	export let genres: { id: number; name: string; ttype: TagType; mode: 'incl' | 'excl' | 'none' }[];

	const sForm = superForm(filtersForm, { dataType: 'json' });
	const { form } = sForm;
</script>

<FiltersWrapper>
	<div class="flex flex-col gap-4">
		<div class="w-fit flex flex-wrap gap-x-4 gap-y-2">
			<Keyed>
				<MultiSelectField
					form={sForm}
					field="rl"
					allSelectedText={getAllOrAny($form.rll)}
					labelText="Release language"
					dropdownOptions={languagesArray.map((v) => ({ display: languageNames[v], value: v }))}
				/>
			</Keyed>

			<SelectField
				form={sForm}
				field="rll"
				dropdownOptions={logicalOps.map((v) => ({ display: v, value: v }))}
				selectedValue={filtersForm.data.rll}
				label="Release langauge filter logic"
				resetPadding={true}
				showRequiredSymbolIfRequired={false}
				fit={true}
			/>

			<Keyed>
				<MultiSelectField
					form={sForm}
					field="rf"
					allSelectedText={getAllOrAny($form.rfl)}
					labelText="Release format"
					dropdownOptions={releaseFormatArray.map((v) => ({ display: v, value: v }))}
				/>
			</Keyed>

			<SelectField
				form={sForm}
				field="rfl"
				dropdownOptions={logicalOps.map((v) => ({ display: v, value: v }))}
				selectedValue={filtersForm.data.rfl}
				label="Release format filter logic"
				resetPadding={true}
				showRequiredSymbolIfRequired={false}
				fit={true}
			/>

			<SelectField
				form={sForm}
				field="sort"
				dropdownOptions={seriesSortArray.map((v) => ({ display: v, value: v }))}
				selectedValue={filtersForm.data.sort}
				label="Sort by"
				resetPadding={true}
				showRequiredSymbolIfRequired={false}
				fit={true}
			/>
		</div>

		<div class="flex flex-col gap-2">
			<TagsFilters {genres} {filtersForm} />

			<div class="flex gap-4">
				<SelectField
					form={sForm}
					field="til"
					dropdownOptions={logicalOps.map((v) => ({ display: v, value: v }))}
					selectedValue={filtersForm.data.til}
					label="Tag inclusion logic"
					resetPadding={true}
					showRequiredSymbolIfRequired={false}
					fit={true}
				/>
				<!-- TODO Implement -->
				<!-- <SelectField
				form={sForm}
				field="tel"
				dropdownOptions={logicalOps.map((v) => ({ display: v, value: v }))}
				selectedValue={filtersForm.data.tel}
				label="Tag exclusion logic"
				resetPadding={true}
				showRequiredSymbolIfRequired={false}
				fit={true}
			/> -->
			</div>
		</div>
	</div>
</FiltersWrapper>
