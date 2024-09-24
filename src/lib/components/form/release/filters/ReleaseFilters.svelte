<script lang="ts">
	import type { releaseFiltersObjSchema } from '$lib/server/zod/schema';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import {
		languageNames,
		languagesArray,
		logicalOps,
		releaseFormatArray,
		releaseSortArray,
		userListStatus,
	} from '$lib/db/dbConsts';
	import Keyed from '../../Keyed.svelte';
	import SelectField from '../../SelectField.svelte';
	import MultiSelectField from '../../MultiSelectField.svelte';
	import FiltersWrapper from '$lib/components/form/filters/FiltersWrapper.svelte';
	import PublisherFilters from '../../filters/publisher/PublisherFilters.svelte';
	import CheckboxField from '../../CheckboxField.svelte';

	export let filtersForm: SuperValidated<Infer<typeof releaseFiltersObjSchema>>;
	export let showSort: boolean = true;
	export let isUser: boolean;
	export let isList: boolean;
	const sForm = superForm(filtersForm, { dataType: 'json' });
</script>

<FiltersWrapper>
	<div class="flex flex-col gap-2">
		{#if isUser}
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
			<CheckboxField form={sForm} field="inUpcoming" label="Release in upcoming" />
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

		<div>
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

		<slot />
	</div>
</FiltersWrapper>
