<script lang="ts">
	import { addToast } from '$lib/components/toast/Toaster.svelte';
	import type { userListLabelsSchema } from '$lib/server/zod/schema';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import SubmitButton from '../../SubmitButton.svelte';
	import Hr from '$lib/components/layout/Hr.svelte';
	import TextField from '$lib/components/form/TextField.svelte';
	import SelectField from '../../SelectField.svelte';
	import Icon from '$lib/components/icon/Icon.svelte';
	import { Dialog } from 'bits-ui';
	import { fade, fly } from 'svelte/transition';
	import { tick } from 'svelte';

	interface Props {
		listLabelsForm: SuperValidated<Infer<typeof userListLabelsSchema>>;
	}

	let { listLabelsForm }: Props = $props();
	let open = $state(false);

	// svelte-ignore state_referenced_locally
	const sForm = superForm(listLabelsForm, {
		dataType: 'json',
		onUpdated: async ({ form }) => {
			if (!form.valid) {
				open = false;
				return;
			}
			await tick();
			open = false;
			addToast({
				data: {
					title: form.message?.text || 'An unknown error has occurred.',
					type: form.message?.type ?? 'success',
				},
			});
		},
		invalidateAll: 'force',
	});
	const { form, enhance, delayed, submitting, message } = sForm;

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

<Dialog.Root bind:open>
	<form method="post" action="?/listlabels" class="flex flex-col gap-4" use:enhance>
		<div class="flex flex-col gap-2">
			<div>
				<h3 class="text-lg font-bold">Custom labels</h3>
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
					<div class="flex items-center justify-between gap-1 pt-[4px] text-sm">
						<div class="flex gap-4">
							<div class="flex">
								<button
									class="btn rounded-full"
									disabled={index === 0}
									onclick={() => {
										swap($form.labels, index, index - 1);
									}}
									type="button"
									aria-label="Move up"><Icon name="chevronUp" /></button
								>
								<button
									class="btn rounded-full"
									disabled={index === $form.labels.length - 1}
									onclick={() => {
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

						<button type="button" class="sub-btn" onclick={() => handleRemoveLabel(index)}
							>Remove</button
						>
					</div>
				</div>
				<Hr />
			{/each}
			<button
				onclick={handleAddLabel}
				class="sub-btn w-fit"
				disabled={$form.labels.length > 50}
				type="button">Add new label</button
			>
		</div>

		<Dialog.Trigger
			type="button"
			class="primary-btn w-full {$delayed ? 'loading' : ''}"
			disabled={$submitting}
		>
			{#if !$delayed}
				Save labels
			{:else}
				<Icon name="loading" class="animate-spin" />
			{/if}
		</Dialog.Trigger>
	</form>

	<Dialog.Portal>
		<Dialog.Overlay forceMount>
			{#snippet child({ props, open: overlayOpen })}
				{#if overlayOpen}
					<div {...props} class="modal-bg" transition:fade={{ duration: 150 }}></div>
				{/if}
			{/snippet}
		</Dialog.Overlay>
		<div class="modal-content">
			<Dialog.Content forceMount>
				{#snippet child({ props, open: contentOpen })}
					{#if contentOpen}
						<div
							{...props}
							class="modal-content-inner confirm-modal"
							transition:fly={{ duration: 250, y: 8 }}
						>
							<Dialog.Title class="text-lg font-medium">Confirm</Dialog.Title>
							<Dialog.Description
								>Are you sure you want to save these custom labels?</Dialog.Description
							>
							<form
								action="?/listlabels"
								method="post"
								use:enhance
								class="mt-6 flex justify-end gap-2"
							>
								<Dialog.Close type="button" class="btn btn-pad">Cancel</Dialog.Close>
								<SubmitButton
									delayed={$delayed}
									submitting={$submitting}
									text="Save labels"
									wFull={false}
								/>
							</form>

							<Dialog.Close aria-label="close" class="close-btn btn">
								<Icon name="close" />
							</Dialog.Close>
						</div>
					{/if}
				{/snippet}
			</Dialog.Content>
		</div>
	</Dialog.Portal>
</Dialog.Root>

<style>
	.modal-content-inner.confirm-modal {
		max-width: 512px;
	}
</style>
