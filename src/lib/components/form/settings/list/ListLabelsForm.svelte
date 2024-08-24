<script lang="ts">
	import { addToast } from '$lib/components/toast/Toaster.svelte';
	import type { userListLabelsSchema } from '$lib/server/zod/schema';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import SubmitButton from '../../SubmitButton.svelte';
	import Hr from '$lib/components/layout/Hr.svelte';
	import TextField from '$lib/components/form/TextField.svelte';
	import SelectField from '../../SelectField.svelte';

	export let listLabelsForm: SuperValidated<Infer<typeof userListLabelsSchema>>;

	const sForm = superForm(listLabelsForm, { dataType: 'json', invalidateAll: 'force' });
	const { form, enhance, delayed, submitting, message } = sForm;

	$: if (!$delayed && $message) {
		addToast({ data: { title: $message.text, type: $message.type } });
	}

	function handleRemoveLabel(index: number) {
		$form.labels.splice(index, 1);
		$form.labels = $form.labels;
	}

	function handleAddLabel() {
		if ($form.labels.length > 50) {
			return;
		}

		$form.labels.push({
			id: undefined,
			label: '',
			private: true,
			target: 'both',
		});
		$form.labels = $form.labels;
	}
</script>

<form method="post" action="?/listlabels" class="flex flex-col gap-4" use:enhance>
	<div class="flex flex-col gap-2">
		<h3 class="font-bold text-lg">Custom labels</h3>

		{#each $form.labels as label, index}
			<div class="flex flex-col">
				<TextField
					form={sForm}
					type="text"
					field="labels[{index}].label"
					resetPadding={true}
					showLabel={false}
				/>
				<div class="flex gap-1 text-sm items-center justify-between pt-[4px]">
					<SelectField
						form={sForm}
						dropdownOptions={['both', 'book', 'series'].map((v) => ({ display: v, value: v }))}
						field="labels[{index}].target"
						fit={true}
						label="Applies to"
						showRequiredSymbolIfRequired={false}
						selectedValue={listLabelsForm.data.labels.at(index)?.target ?? 'both'}
						resetPadding={true}
						column={false}
					/>

					<button type="button" class="sub-btn" on:click={() => handleRemoveLabel(index)}
						>Remove</button
					>
				</div>
			</div>
			<Hr />
		{/each}
		<button
			on:click={handleAddLabel}
			class="sub-btn w-fit"
			disabled={$form.labels.length > 50}
			type="button">Add new label</button
		>
	</div>

	<SubmitButton delayed={$delayed} submitting={$submitting} text={'Save labels'} />
</form>
