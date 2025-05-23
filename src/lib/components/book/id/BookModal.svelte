<script lang="ts">
	import { createDialog, melt } from '@melt-ui/svelte';
	import Icon from '$lib/components/icon/Icon.svelte';
	import { fade, fly } from 'svelte/transition';
	import type { BookOne } from '$lib/server/db/books/books';
	import type { userListBookSchema } from '$lib/server/zod/schema';
	import type { Infer, SuperValidated } from 'sveltekit-superforms';
	import { superForm } from 'sveltekit-superforms';
	import TextField from '$lib/components/form/TextField.svelte';
	import SubmitButton from '$lib/components/form/SubmitButton.svelte';
	import { tick } from 'svelte';
	import { addToast } from '$lib/components/toast/Toaster.svelte';
	import SelectField from '$lib/components/form/SelectField.svelte';
	import { defaultUserListLabelsArray } from '$lib/db/dbConsts';
	import TitleDisplay from '$lib/components/display/TitleDisplay.svelte';
	import MultiSelectField from '$lib/components/form/MultiSelectField.svelte';

	interface Props {
		book: BookOne;
		userListForm: SuperValidated<Infer<typeof userListBookSchema>>;
		allCustLabels: { id: number; label: string }[];
	}

	let { book, userListForm, allCustLabels }: Props = $props();

	const readingStatuses = defaultUserListLabelsArray.map((v) => {
		return { display: v, value: v };
	});

	const sForm = superForm(userListForm, {
		dataType: 'json',
		onUpdated: async ({ form }) => {
			if (!form.valid) return;

			openNested.set(false);
			await tick();
			open.set(false);

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

	const {
		elements: { trigger, overlay, content, title, close, portalled },
		states: { open },
	} = createDialog({
		forceVisible: true,
		preventScroll: false,
	});

	const {
		elements: {
			trigger: triggerNested,
			overlay: overlayNested,
			content: contentNested,
			title: titleNested,
			description: descriptionNested,
			close: closeNested,
			portalled: portalledNested,
		},
		states: { open: openNested },
	} = createDialog({ forceVisible: true, preventScroll: false });

	let modalTitle = $derived(
		$form.type === 'add' ? 'Add book to reading list' : 'Update book in reading list',
	);
	let modalSubmitText = $derived($form.type === 'add' ? 'Add to reading list' : 'Update');
</script>

<div class="flex justify-center">
	<button use:melt={$trigger} class="primary-btn w-full max-w-xs"
		>{$form.labels.at(0)?.label ?? 'Add to reading list'}</button
	>
</div>

{#if $open}
	<div use:melt={$portalled}>
		<div use:melt={$overlay} class="modal-bg" transition:fade={{ duration: 150 }}></div>
		<div class="modal-content">
			<div
				transition:fly={{
					duration: 250,
					y: 8,
				}}
				use:melt={$content}
				class="modal-content-inner"
			>
				<div class="flex flex-col gap-2">
					<div class="flex flex-col">
						<h2 use:melt={$title} class="font-medium">{modalTitle}</h2>
						<h3 class="text-xl font-bold"><TitleDisplay obj={book} /></h3>
					</div>

					<form
						action="/api/i/user/book/{book.id}"
						method="post"
						class="flex flex-col gap-4"
						use:enhance
					>
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-x-2 sm:gap-x-4">
							<div class="flex flex-col gap-2">
								<SelectField
									form={sForm}
									field="readingStatus"
									label="Reading status"
									dropdownOptions={readingStatuses}
									showRequiredSymbolIfRequired={false}
									selectedValue={$form.readingStatus}
									fit={false}
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

						<div class="flex flex-col sm:flex-row justify-end gap-2">
							<SubmitButton
								value={$form.type}
								text={modalSubmitText}
								delayed={$delayed && !$openNested}
								submitting={$submitting && !$openNested}
							/>
							{#if $form.type === 'update'}
								<button
									disabled={$submitting}
									type="button"
									use:melt={$triggerNested}
									class="whitespace-nowrap btn btn-pad">Remove from list</button
								>
							{/if}
						</div>
					</form>
				</div>

				<button use:melt={$close} aria-label="close" class="close-btn btn">
					<Icon name="close" />
				</button>

				{#if $openNested}
					<div use:melt={$portalledNested}>
						<div
							use:melt={$overlayNested}
							class="modal-bg"
							transition:fade={{ duration: 150 }}
						></div>
						<div class="modal-content">
							<div
								class="modal-content-inner confirm-modal"
								transition:fly={{
									duration: 250,
									y: 8,
								}}
								use:melt={$contentNested}
							>
								<h2 use:melt={$titleNested} class="text-lg font-medium">Warning</h2>
								<p use:melt={$descriptionNested}>
									Are you sure you want to remove this book from your list?
									<span class="text-sm"
										>Removing this book will also remove any associated releases you have added to
										your list.</span
									>
								</p>

								<form
									action="/api/i/user/book/{book.id}"
									method="post"
									use:enhance
									class="mt-6 flex justify-end gap-2"
								>
									<button type="button" use:melt={$closeNested} class="btn btn-pad">Cancel</button>
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

								<button use:melt={$closeNested} aria-label="close" class="close-btn btn">
									<Icon name="close" />
								</button>
							</div>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-content-inner.confirm-modal {
		max-width: 512px;
	}
</style>
