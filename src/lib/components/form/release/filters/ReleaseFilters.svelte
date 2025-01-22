<script lang="ts">
	import type { releaseFiltersObjSchema } from '$lib/server/zod/schema';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import {
		languageNames,
		languagesArray,
		logicalOps,
		releaseFormatArray,
		releaseSortArray,
		userListReleaseStatus,
		userListStatus,
	} from '$lib/db/dbConsts';
	import Keyed from '../../Keyed.svelte';
	import SelectField from '../../SelectField.svelte';
	import MultiSelectField from '../../MultiSelectField.svelte';
	import FiltersWrapper from '$lib/components/form/filters/FiltersWrapper.svelte';
	import PublisherFilters from '../../filters/publisher/PublisherFilters.svelte';
	import CheckboxField from '../../CheckboxField.svelte';
	import TextField from '../../TextField.svelte';

	export let filtersForm: SuperValidated<Infer<typeof releaseFiltersObjSchema>>;
	export let showSort: boolean = true;
	export let isUser: boolean;
	export let isList: boolean;
	export let allowPublisherFiltersLogic: boolean = true;
	export let isCalendar: boolean = false;
	const sForm = superForm(filtersForm, { dataType: 'json' });
</script>

<FiltersWrapper>
	<div class="flex flex-col gap-2">
		{#if isUser}
			<div class="max-w-fit">
				<Keyed>
					<MultiSelectField
						form={sForm}
						field="l"
						noneSelectedText="any"
						allSelectedText="any"
						labelText="List label status"
						dropdownOptions={userListReleaseStatus.map((v) => ({
							display: v,
							value: v,
						}))}
					/>
				</Keyed>
			</div>
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
				<CheckboxField
					form={sForm}
					field="inUpcoming"
					label="Release in upcoming/previously released"
				/>
			{/if}
			{#if isCalendar}
				<CheckboxField
					form={sForm}
					field="onlyFirst"
					label="Only show releases of the first book in a series"
				/>
			{/if}
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

		{#if !isCalendar}
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
		{/if}

		<div>
			<PublisherFilters {filtersForm} />
			{#if allowPublisherFiltersLogic}
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
			{/if}
		</div>

		<slot />
	</div>
</FiltersWrapper>
