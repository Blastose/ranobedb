<script lang="ts">
	import type { userReviewSchema } from '$lib/server/zod/schema';
	import SuperDebug, { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import SubmitButton from '$lib/components/form/SubmitButton.svelte';
	import { addToast } from '$lib/components/toast/Toaster.svelte';
	import TextareaFieldMarkdown from '../TextareaFieldMarkdown.svelte';
	import CheckboxField from '../CheckboxField.svelte';
	import { Dialog } from 'bits-ui';
	import Icon from '$lib/components/icon/Icon.svelte';
	import { fade, fly } from 'svelte/transition';
	import TextField from '../TextField.svelte';

	interface Props {
		title: string;
		itemType: 'book' | 'series';
		itemId: number;
		userReviewForm: SuperValidated<Infer<typeof userReviewSchema>>;
		actionUrl?: string;
	}

	let { title, itemType, itemId, userReviewForm, actionUrl = undefined }: Props = $props();

	let open = $state(false);

	// svelte-ignore state_referenced_locally
	const sForm = superForm(userReviewForm, {
		dataType: 'json',
		onUpdated({ form: f }) {
			if (!f.valid) {
				addToast({ data: { title: f.message?.text || 'Error in form!', type: 'error' } });
			}
		},
	});
	const { form, enhance, delayed, submitting } = sForm;

	let type = $derived($form.type);
	let submitButtonText = $derived(type === 'add' ? 'Submit' : 'Submit edit');
</script>

<!-- <SuperDebug data={$form} /> -->

<Dialog.Root bind:open>
	<form method="post" class="mt-2 flex flex-col gap-4" action={actionUrl} use:enhance>
		<h2 class="text-2xl font-bold">{type === 'add' ? 'Submit' : 'Edit'} {itemType} review</h2>

		<div>
			<p>You are {type === 'add' ? 'writing a' : 'editing your'} review for the {itemType}:</p>
			<a target="_blank" class="link text-xl font-bold" href="/{itemType}/{itemId}">{title}</a>
		</div>

		<div class="flex flex-col gap-y-1">
			{#if itemType === 'series'}
				<div class="flex flex-col gap-1">
					<div class="w-fit">
						<TextField
							form={sForm}
							type="number"
							field="volumes_read"
							label="Volumes read"
							placeholder=""
							resetPadding={true}
						/>
					</div>
					<p class="sub-text text-sm">
						How many volumes you have read at the time of the review. Pre-filled from your list
						data, but it can be changed if needed.
					</p>
				</div>
			{/if}
			<div class="flex flex-col gap-1">
				<div class="w-fit">
					<TextField
						form={sForm}
						type="number"
						field="score"
						label="Score"
						placeholder=""
						resetPadding={true}
					/>
				</div>
				<p class="sub-text text-sm">
					This score is pre-filled with your list score, but it can be changed if needed.
				</p>
			</div>
		</div>

		<div>
			<CheckboxField form={sForm} field="spoiler" label="This review contains unmarked spoilers" />
			<div class="sub-text markdown text-sm">
				You do not need to check this box if all spoilers in your review are marked with spoiler
				tags <code>{'>!!<'}</code>
			</div>
		</div>

		<TextareaFieldMarkdown
			form={sForm}
			type="textarea"
			field="review_text"
			label="Review"
			textareaRows={12}
			placeholder="Review"
			labelId="review-text"
			showRequiredSymbolIfRequired={false}
		/>

		<div class="flex gap-2">
			<SubmitButton delayed={$delayed} submitting={$submitting} text={submitButtonText} />
			{#if type === 'update'}
				<Dialog.Trigger type="button" class="btn btn-pad max-w-xs whitespace-nowrap"
					>Delete review</Dialog.Trigger
				>
			{/if}
		</div>
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
							<Dialog.Title class="text-lg font-medium">Warning</Dialog.Title>
							<Dialog.Description>
								Are you sure you want to delete this review?
								<span class="text-sm">You cannot recover this review after you delete it.</span>
							</Dialog.Description>

							<form
								action={actionUrl}
								method="post"
								use:enhance
								class="mt-6 flex justify-end gap-2"
							>
								<Dialog.Close type="button" class="btn btn-pad">Cancel</Dialog.Close>
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

<style>
	.modal-content-inner.confirm-modal {
		max-width: 512px;
	}
</style>
