<script lang="ts">
	import type { bookFiltersObjSchema } from '$lib/server/zod/schema';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import {
		booksSortArray,
		booksUserListSortArray,
		languageNames,
		languagesArray,
		logicalOps,
		releaseFormatArray,
		userListStatus,
	} from '$lib/db/dbConsts';
	import Keyed from '../../Keyed.svelte';
	import SelectField from '../../SelectField.svelte';
	import MultiSelectField from '../../MultiSelectField.svelte';
	import FiltersWrapper from '$lib/components/form/filters/FiltersWrapper.svelte';
	import StaffPublisherFilters from '../../filters/StaffPublisherFilters.svelte';
	import TextField from '../../TextField.svelte';

	export let filtersForm: SuperValidated<Infer<typeof bookFiltersObjSchema>>;
	export let isUser: boolean;
	export let isList: boolean;
	export let allCustLabels: {
		id: number;
		label: string;
	}[] = [];
	const sForm = superForm(filtersForm, { dataType: 'json' });

	$: sortFiltersToUse = isList ? booksUserListSortArray : booksSortArray;
</script>

<FiltersWrapper>
	<div class="flex flex-col gap-4">
		{#if isUser}
			<div class="flex flex-wrap gap-4">
				<Keyed>
					<MultiSelectField
						form={sForm}
						field="l"
						noneSelectedText="any"
						allSelectedText="any"
						labelText="Labels"
						dropdownOptions={allCustLabels.map((v) => ({
							display: v.label,
							value: v.id,
						}))}
					/>
				</Keyed>
				{#if !isList}
					<SelectField
						form={sForm}
						field="list"
						dropdownOptions={userListStatus.map((v) => ({ display: v, value: v }))}
						selectedValue={filtersForm.data.list}
						label="List status"
						resetPadding={true}
						showRequiredSymbolIfRequired={false}
						fit={true}
					/>
				{/if}
			</div>
		{/if}

		<div class="w-fit flex flex-wrap gap-x-4 gap-y-2">
			<Keyed>
				<MultiSelectField
					form={sForm}
					field="rl"
					noneSelectedText="any"
					allSelectedText="any"
					labelText="Release language"
					dropdownOptions={languagesArray.map((v) => ({ display: languageNames[v], value: v }))}
				/>
			</Keyed>

			<SelectField
				form={sForm}
				field="rll"
				dropdownOptions={logicalOps.map((v) => ({ display: v, value: v }))}
				selectedValue={filtersForm.data.rll}
				label="Release language filter logic"
				resetPadding={true}
				showRequiredSymbolIfRequired={false}
				fit={true}
			/>

			<Keyed>
				<MultiSelectField
					form={sForm}
					field="rlExclude"
					noneSelectedText="none"
					allSelectedText="all"
					labelText="Release language exclude"
					dropdownOptions={languagesArray.map((v) => ({ display: languageNames[v], value: v }))}
				/>
			</Keyed>

			<Keyed>
				<MultiSelectField
					form={sForm}
					field="rf"
					noneSelectedText="any"
					allSelectedText="any"
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
				dropdownOptions={sortFiltersToUse.map((v) => ({ display: v, value: v }))}
				selectedValue={filtersForm.data.sort}
				label="Sort by"
				resetPadding={true}
				showRequiredSymbolIfRequired={false}
				fit={true}
			/>
		</div>

		<div class="flex flex-wrap gap-4">
			<div class="flex gap-2">
				<TextField
					label="Min. release date"
					form={sForm}
					field="minDate"
					type="date"
					resetPadding={true}
				/>
				<TextField
					label="Max. release date"
					form={sForm}
					field="maxDate"
					type="date"
					resetPadding={true}
				/>
			</div>
		</div>

		<StaffPublisherFilters {filtersForm} />
	</div>
</FiltersWrapper>
