<script lang="ts">
	import type { seriesFiltersObjSchema } from '$lib/server/zod/schema';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import {
		languageNames,
		languagesArray,
		logicalOps,
		releaseFormatArray,
		seriesSortArray,
		seriesStatusArray,
		userListStatus,
	} from '$lib/db/dbConsts';
	import Keyed from '../../Keyed.svelte';
	import SelectField from '../../SelectField.svelte';
	import MultiSelectField from '../../MultiSelectField.svelte';
	import TagsFilters from './tags/TagsFilters.svelte';
	import type { TagType } from '$lib/server/db/dbTypes';
	import FiltersWrapper from '$lib/components/form/filters/FiltersWrapper.svelte';
	import StaffPublisherFilters from '../../filters/StaffPublisherFilters.svelte';
	import TextField from '../../TextField.svelte';

	export let filtersForm: SuperValidated<Infer<typeof seriesFiltersObjSchema>>;
	export let genres: { id: number; name: string; ttype: TagType; mode: 'incl' | 'excl' | 'none' }[];
	export let isUser: boolean;
	export let isList: boolean;
	export let allCustLabels: {
		id: number;
		label: string;
	}[] = [];
	const sForm = superForm(filtersForm, { dataType: 'json' });
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
				label="Release langauge filter logic"
				resetPadding={true}
				showRequiredSymbolIfRequired={false}
				fit={true}
			/>

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
				dropdownOptions={seriesSortArray.map((v) => ({ display: v, value: v }))}
				selectedValue={filtersForm.data.sort}
				label="Sort by"
				resetPadding={true}
				showRequiredSymbolIfRequired={false}
				fit={true}
			/>
		</div>

		<div class="flex flex-col gap-2">
			<div class="w-fit">
				<Keyed>
					<MultiSelectField
						form={sForm}
						field="pubStatus"
						noneSelectedText="any"
						allSelectedText="any"
						labelText="Pub. status"
						dropdownOptions={seriesStatusArray.map((v) => ({ display: v, value: v }))}
					/>
				</Keyed>
			</div>

			<div class="flex flex-wrap gap-4">
				<div class="flex gap-2">
					<TextField
						label="Min. start date"
						form={sForm}
						field="minStartDate"
						type="date"
						resetPadding={true}
					/>
					<TextField
						label="Max. start date"
						form={sForm}
						field="maxStartDate"
						type="date"
						resetPadding={true}
					/>
				</div>

				<div class="flex gap-2">
					<TextField
						label="Min. end date"
						form={sForm}
						field="minEndDate"
						type="date"
						resetPadding={true}
					/>
					<TextField
						label="Max. end date"
						form={sForm}
						field="maxEndDate"
						type="date"
						resetPadding={true}
					/>
				</div>
			</div>

			<div class="flex gap-2">
				<TextField
					label="Min. volumes"
					form={sForm}
					field="minVolumes"
					type="number"
					resetPadding={true}
				/>
				<TextField
					label="Max. volumes"
					form={sForm}
					field="maxVolumes"
					type="number"
					resetPadding={true}
				/>
			</div>

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
		<StaffPublisherFilters {filtersForm} />
	</div>
</FiltersWrapper>
