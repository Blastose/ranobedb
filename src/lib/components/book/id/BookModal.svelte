<script lang="ts">
	import { Dialog } from 'bits-ui';
	import Icon from '$lib/components/icon/Icon.svelte';
	import { fade, fly } from 'svelte/transition';
	import type { BookOne } from '$lib/server/db/books/books';
	import type { userListBookSchema } from '$lib/server/zod/schema';
	import type { Infer, SuperValidated } from 'sveltekit-superforms';
	import { superForm, formFieldProxy } from 'sveltekit-superforms';
	import TextField from '$lib/components/form/TextField.svelte';
	import SubmitButton from '$lib/components/form/SubmitButton.svelte';
	import { tick } from 'svelte';
	import { addToast } from '$lib/components/toast/Toaster.svelte';
	import SelectField from '$lib/components/form/SelectField.svelte';
	import { defaultUserListLabelsArray } from '$lib/db/dbConsts';
	import TitleDisplay from '$lib/components/display/TitleDisplay.svelte';
	import MultiSelectField from '$lib/components/form/MultiSelectField.svelte';
	import { defaultUserListLabelsCssClass } from '$lib/utils/colors';
	import LabelIcon from '$lib/components/icon/LabelIcon.svelte';
	import type { ReadingStatus } from '$lib/server/db/dbTypes';
	import { getBehaviorSettingsContext } from '$lib/display/prefs';
	import { applyReadingStatusToForm } from '$lib/utils/autoFillDates';

	interface Props {
		book: BookOne;
		userListForm: SuperValidated<Infer<typeof userListBookSchema>>;
		allCustLabels: { id: number; label: string }[];
	}

	let { book, userListForm, allCustLabels }: Props = $props();

	const readingStatuses = defaultUserListLabelsArray.map((v) => {
		return { display: v, value: v };
	});

	let open = $state(false);
	let openNested = $state(false);

	// svelte-ignore state_referenced_locally
	const sForm = superForm(userListForm, {
		dataType: 'json',
		onUpdated: async ({ form }) => {
			if (!form.valid) return;

			openNested = false;
			await tick();
			open = false;

			addToast({
				data: {
					title: form.message?.text ?? 'Success',
					type: 'success',
				},
			});
		},
		taintedMessage: null,
		invalidateAll: 'force',
	});

	const { form, enhance, delayed, submitting } = sForm;

	const behaviorSettings = getBehaviorSettingsContext();

	const startedField = formFieldProxy(sForm, 'started');
	const finishedField = formFieldProxy(sForm, 'finished');

	if ($form.type === 'add') {
		applyReadingStatusToForm(
			startedField,
			finishedField,
			$form.readingStatus,
			false,
			$behaviorSettings,
		);
	}

	let prevStatus = $form.readingStatus;
	function handleStatusChange(newStatus: ReadingStatus) {
		if (newStatus === prevStatus) return;
		prevStatus = newStatus;
		applyReadingStatusToForm(
			startedField,
			finishedField,
			newStatus,
			$form.type === 'update',
			$behaviorSettings,
		);
	}

	let modalTitle = $derived(
		$form.type === 'add' ? 'Add book to reading list' : 'Update book in reading list',
	);
	let modalSubmitText = $derived($form.type === 'add' ? 'Add to reading list' : 'Update');
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger
		class="primary-btn flex w-full max-w-xs items-center gap-1 {defaultUserListLabelsCssClass(
			$form.labels.at(0)?.label,
		)}"
		><LabelIcon label={$form.labels.at(0)?.label} />{$form.labels.at(0)?.label ??
			'Add to reading list'}</Dialog.Trigger
	>
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
						<div {...props} class="modal-content-inner" transition:fly={{ duration: 250, y: 8 }}>
							<div class="flex flex-col gap-2">
								<div class="flex flex-col">
									<Dialog.Title class="font-medium">{modalTitle}</Dialog.Title>
									<h3 class="text-xl font-bold"><TitleDisplay obj={book} /></h3>
								</div>

								<Dialog.Root bind:open={openNested}>
									<form
										action="/api/i/user/book/{book.id}"
										method="post"
										class="flex flex-col gap-4"
										use:enhance
									>
										<div class="grid grid-cols-1 gap-x-2 sm:grid-cols-2 sm:gap-x-4">
											<div class="flex flex-col gap-2">
												<SelectField
													form={sForm}
													field="readingStatus"
													label="Reading status"
													dropdownOptions={readingStatuses}
													showRequiredSymbolIfRequired={false}
													selectedValue={$form.readingStatus}
													fit={false}
													onChange={handleStatusChange}
												/>
												<TextField form={sForm} type="date" field="started" label="Started" />
												<TextField form={sForm} type="date" field="finished" label="Finished" />
											</div>
											<div class="flex flex-col gap-2">
												<TextField
													form={sForm}
													type="number"
													field="score"
													label="Score"
													placeholder="Score (between 1 and 10)"
												/>
												<TextField
													form={sForm}
													type="textarea"
													field="notes"
													label="Notes"
													textareaRows={2}
												/>

												<MultiSelectField
													form={sForm}
													field="selectedCustLabels"
													noneSelectedText="None"
													allSelectedText={undefined}
													labelText="Custom labels"
													dropdownOptions={allCustLabels.map((v) => ({
														display: v.label,
														value: v.id,
													}))}
												/>
											</div>
										</div>

										<div class="flex flex-col justify-end gap-2 sm:flex-row">
											<SubmitButton
												value={$form.type}
												text={modalSubmitText}
												delayed={$delayed && !openNested}
												submitting={$submitting && !openNested}
											/>
											{#if $form.type === 'update'}
												<Dialog.Trigger
													disabled={$submitting}
													type="button"
													class="btn btn-pad whitespace-nowrap"
												>
													Remove from list
												</Dialog.Trigger>
											{/if}
										</div>
									</form>

									<Dialog.Portal>
										<Dialog.Overlay forceMount>
											{#snippet child({ props, open: overlayOpenNested })}
												{#if overlayOpenNested}
													<div
														{...props}
														class="modal-bg"
														transition:fade={{ duration: 150 }}
													></div>
												{/if}
											{/snippet}
										</Dialog.Overlay>
										<div class="modal-content">
											<Dialog.Content forceMount>
												{#snippet child({ props, open: contentOpenNested })}
													{#if contentOpenNested}
														<div
															{...props}
															class="modal-content-inner confirm-modal"
															transition:fly={{ duration: 250, y: 8 }}
														>
															<Dialog.Title class="text-lg font-medium">Warning</Dialog.Title>
															<Dialog.Description>
																Are you sure you want to remove this book from your list?
																<span class="text-sm"
																	>Removing this book will also remove any associated releases you
																	have added to your list.</span
																>
															</Dialog.Description>

															<form
																action="/api/i/user/book/{book.id}"
																method="post"
																use:enhance
																class="mt-6 flex justify-end gap-2"
															>
																<Dialog.Close type="button" class="btn btn-pad">Cancel</Dialog.Close
																>
																<button
																	onclick={() => {
																		$form.type = 'delete';
																	}}
																	type="submit"
																	class="primary-btn"
																>
																	Delete
																</button>
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
							</div>

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
