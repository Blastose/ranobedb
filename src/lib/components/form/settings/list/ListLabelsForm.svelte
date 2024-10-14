<script lang="ts">
	import { addToast } from '$lib/components/toast/Toaster.svelte';
	import type { userListLabelsSchema } from '$lib/server/zod/schema';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import SubmitButton from '../../SubmitButton.svelte';
	import Hr from '$lib/components/layout/Hr.svelte';
	import TextField from '$lib/components/form/TextField.svelte';
	import SelectField from '../../SelectField.svelte';
	import Icon from '$lib/components/icon/Icon.svelte';
	import { createDialog, melt } from '@melt-ui/svelte';
	import { fade, fly } from 'svelte/transition';
	import { tick } from 'svelte';

	export let listLabelsForm: SuperValidated<Infer<typeof userListLabelsSchema>>;

	const {
		elements: { trigger, overlay, content, title, close, portalled, description },
		states: { open },
	} = createDialog({
		forceVisible: true,
		preventScroll: false,
	});

	const sForm = superForm(listLabelsForm, {
		dataType: 'json',
		onUpdated: async ({ form }) => {
			if (!form.valid) {
				open.set(false);
				return;
			}
			await tick();
			open.set(false);
		},
		invalidateAll: 'force',
	});
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

	function swap<T>(arr: T[], indexL: number, indexR: number) {
		if (indexL < 0 || indexR < 0) return;
		if (indexL > arr.length - 1 || indexR > arr.length - 1) return;

		[arr[indexR], arr[indexL]] = [arr[indexL], arr[indexR]];
		$form.labels = $form.labels;
	}
</script>

<form method="post" action="?/listlabels" class="flex flex-col gap-4" use:enhance>
	<div class="flex flex-col gap-2">
		<div>
			<h3 class="font-bold text-lg">Custom labels</h3>
			<p class="text-sm">(Max 50 custom labels)</p>
		</div>

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
					<div class="flex gap-4">
						<div class="flex">
							<button
								class="btn rounded-full"
								disabled={index === 0}
								on:click={() => {
									swap($form.labels, index, index - 1);
								}}
								type="button"
								aria-label="Move up"><Icon name="chevronUp" /></button
							>
							<button
								class="btn rounded-full"
								disabled={index === $form.labels.length - 1}
								on:click={() => {
									swap($form.labels, index, index + 1);
								}}
								type="button"
								aria-label="Move down"><Icon name="chevronDown" /></button
							>
						</div>
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
					</div>

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

	<button
		use:melt={$trigger}
		class="primary-btn w-full"
		type="button"
		class:loading={$delayed}
		disabled={$submitting}
	>
		{#if !$delayed}
			Save labels
		{:else}
			<Icon name="loading" class="animate-spin" />
		{/if}</button
	>
</form>

{#if $open}
	<div use:melt={$portalled}>
		<div use:melt={$overlay} class="modal-bg" transition:fade={{ duration: 150 }} />
		<div class="modal-content">
			<div
				class="modal-content-inner confirm-modal"
				transition:fly={{
					duration: 250,
					y: 8,
				}}
				use:melt={$content}
			>
				<h2 use:melt={$title} class="text-lg font-medium">Confirm</h2>
				<p use:melt={$description}>Are you sure you want to save these custom labels?</p>
				<form action="?/listlabels" method="post" use:enhance class="mt-6 flex justify-end gap-2">
					<button type="button" use:melt={$close} class="btn btn-pad">Cancel</button>
					<SubmitButton
						delayed={$delayed}
						submitting={$submitting}
						text="Save labels"
						wFull={false}
					/>
				</form>

				<button use:melt={$close} aria-label="close" class="close-btn btn">
					<Icon name="close" />
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-content-inner.confirm-modal {
		max-width: 512px;
	}
</style>
