<script lang="ts">
	import { createDialog, melt } from '@melt-ui/svelte';
	import Icon from '$lib/components/icon/Icon.svelte';
	import { fade, fly } from 'svelte/transition';
	import type { BookR } from '$lib/server/db/books/books';
	import { defaultUserListLabelsArray, type userListBookSchema } from '$lib/zod/schema';
	import type { SuperValidated } from 'sveltekit-superforms';
	import { superForm } from 'sveltekit-superforms/client';
	import TextField from '$lib/components/form/TextField.svelte';
	import SubmitButton from '$lib/components/form/SubmitButton.svelte';
	import { tick } from 'svelte';
	import { addToast } from '$lib/components/toast/Toaster.svelte';
	import SelectField from '$lib/components/form/SelectField.svelte';

	export let book: BookR;
	export let userListForm: SuperValidated<typeof userListBookSchema>;

	const readingStatuses = defaultUserListLabelsArray.map((v) => {
		return { display: v, value: v };
	});

	$: sForm = superForm(userListForm, {
		dataType: 'json',
		onUpdate: async ({ form }) => {
			if (!form.valid) return;

			openNested.set(false);
			await tick();
			open.set(false);

			addToast({
				data: {
					title: form.message?.text ?? 'Success',
					type: 'success'
				}
			});
		}
	});

	$: ({ form, enhance, delayed, submitting } = sForm);

	const {
		elements: { trigger, overlay, content, title, close, portalled },
		states: { open }
	} = createDialog({
		forceVisible: true,
		preventScroll: false
	});

	const {
		elements: {
			trigger: triggerNested,
			overlay: overlayNested,
			content: contentNested,
			title: titleNested,
			description: descriptionNested,
			close: closeNested,
			portalled: portalledNested
		},
		states: { open: openNested }
	} = createDialog({ forceVisible: true, preventScroll: false });

	$: modalTitle = $form.type === 'add' ? 'Add book to reading list' : 'Update book in reading list';
</script>

<button use:melt={$trigger} class="rounded-md px-4 py-2 text-white bg-[var(--primary-500)]"
	>{$form.labels.at(0)?.label ?? 'Add'}</button
>

<div use:melt={$portalled}>
	{#if $open}
		<div use:melt={$overlay} class="modal-bg" transition:fade={{ duration: 150 }} />
		<div
			class="modal-content"
			transition:fly={{
				duration: 250,
				y: 8
			}}
			use:melt={$content}
		>
			<div class="flex flex-col gap-2">
				<div class="flex flex-col">
					<h2 use:melt={$title} class="font-medium">{modalTitle}</h2>
					<h3 class="text-xl font-bold">{book.title}</h3>
				</div>

				<form
					action="/api/i/user/book/{book.id}"
					method="post"
					class="flex flex-col gap-4"
					use:enhance
				>
					<div class="flex flex-col gap-2">
						<SelectField
							form={sForm}
							field="readingStatus"
							label="Reading status"
							dropdownOptions={readingStatuses}
							showRequiredSymbolIfRequired={false}
							selectedValue={$form.readingStatus}
						/>
						<TextField form={sForm} type="date" field="started" label="Started" />
						<TextField form={sForm} type="date" field="finished" label="Finished" />
						<TextField
							form={sForm}
							type="number"
							field="score"
							label="Score"
							placeholder="Score (between 1 and 10)"
						/>
						<TextField form={sForm} type="textarea" field="notes" label="Notes" textareaRows={2} />
					</div>

					<div class="flex flex-col sm:flex-row gap-2">
						<SubmitButton
							value={$form.type}
							text="Save"
							delayed={$delayed && !$openNested}
							submitting={$submitting && !$openNested}
						/>
						{#if $form.type === 'update'}
							<button
								type="button"
								use:melt={$triggerNested}
								disabled={$submitting}
								class="whitespace-nowrap btn px-4 py-2 rounded-md">Remove from list</button
							>
						{/if}
					</div>
				</form>
				<button use:melt={$close} aria-label="close" class="close-btn btn">
					<Icon name="close" />
				</button>
			</div>

			<div use:melt={$portalledNested}>
				{#if $openNested}
					<div use:melt={$overlayNested} class="modal-bg" transition:fade={{ duration: 150 }} />
					<div
						class="modal-content confirm-modal"
						transition:fly={{
							duration: 250,
							y: 8
						}}
						use:melt={$contentNested}
					>
						<h2 use:melt={$titleNested} class="text-lg font-medium">Warning</h2>
						<p use:melt={$descriptionNested}>
							Are you sure you want to remove this book from your list?
						</p>

						<form
							action="/api/i/user/book/{book.id}"
							method="post"
							use:enhance
							class="mt-6 flex justify-end gap-2"
						>
							<button
								disabled={$submitting}
								type="button"
								use:melt={$closeNested}
								class="btn px-4 py-2 rounded-md">Cancel</button
							>
							<button
								disabled={$submitting}
								on:click={() => {
									$form.type = 'delete';
								}}
								type="submit"
								class="text-white px-4 py-2 rounded-md bg-[var(--primary-500)]"
							>
								Delete
							</button>
						</form>

						<button use:melt={$closeNested} aria-label="close" class="close-btn btn">
							<Icon name="close" />
						</button>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.confirm-modal {
		max-width: 512px;
		max-height: 200px;
	}
</style>
