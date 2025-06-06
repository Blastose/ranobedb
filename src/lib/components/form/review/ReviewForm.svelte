<script lang="ts">
	import type { userReviewSchema } from '$lib/server/zod/schema';
	import SuperDebug, { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import SubmitButton from '$lib/components/form/SubmitButton.svelte';
	import { addToast } from '$lib/components/toast/Toaster.svelte';
	import TextareaFieldMarkdown from '../TextareaFieldMarkdown.svelte';
	import CheckboxField from '../CheckboxField.svelte';
	import { createDialog, melt } from '@melt-ui/svelte';
	import Icon from '$lib/components/icon/Icon.svelte';
	import { fade, fly } from 'svelte/transition';
	import TextField from '../TextField.svelte';

	export let title: string;
	export let itemType: 'book' | 'series';
	export let itemId: number;
	export let userReviewForm: SuperValidated<Infer<typeof userReviewSchema>>;
	export let actionUrl: string | undefined = undefined;

	const sForm = superForm(userReviewForm, {
		dataType: 'json',
		onUpdated({ form: f }) {
			if (!f.valid) {
				addToast({ data: { title: f.message?.text || 'Error in form!', type: 'error' } });
			}
		},
	});
	const { form, enhance, delayed, submitting } = sForm;

	const {
		elements: { trigger, overlay, content, title: meltTitle, close, portalled, description },
		states: { open },
	} = createDialog({
		forceVisible: true,
		preventScroll: false,
	});

	$: type = $form.type;
	$: submitButtonText = type === 'add' ? 'Submit' : 'Submit edit';
</script>

<!-- <SuperDebug data={$form} /> -->

<form method="post" class="flex flex-col gap-4 mt-2" action={actionUrl} use:enhance>
	<h2 class="font-bold text-2xl">{type === 'add' ? 'Submit' : 'Edit'} {itemType} review</h2>

	<div>
		<p>You are {type === 'add' ? 'writing a' : 'editing your'} review for the {itemType}:</p>
		<a target="_blank" class="link font-bold text-xl" href="/{itemType}/{itemId}">{title}</a>
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
				<p class="text-sm sub-text">
					How many volumes you have read at the time of the review. Pre-filled from your list data,
					but it can be changed if needed.
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
			<p class="text-sm sub-text">
				This score is pre-filled with your list score, but it can be changed if needed.
			</p>
		</div>
	</div>

	<div>
		<CheckboxField form={sForm} field="spoiler" label="This review contains unmarked spoilers" />
		<div class="text-sm sub-text markdown">
			You do not need to check this box if all spoilers in your review are marked with spoiler tags <code
				>{'>!!<'}</code
			>
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
			<button use:melt={$trigger} class="btn btn-pad whitespace-nowrap max-w-xs"
				>Delete review</button
			>
		{/if}
	</div>
</form>

{#if $open}
	<div use:melt={$portalled}>
		<div use:melt={$overlay} class="modal-bg" transition:fade={{ duration: 150 }}></div>
		<div class="modal-content">
			<div
				class="modal-content-inner confirm-modal"
				transition:fly={{
					duration: 250,
					y: 8,
				}}
				use:melt={$content}
			>
				<h2 use:melt={$meltTitle} class="text-lg font-medium">Warning</h2>
				<p use:melt={$description}>
					Are you sure you want to delete this review?
					<span class="text-sm">You cannot recover this review after you delete it.</span>
				</p>

				<form action={actionUrl} method="post" use:enhance class="mt-6 flex justify-end gap-2">
					<button type="button" use:melt={$close} class="btn btn-pad">Cancel</button>
					<button
						on:click={() => {
							$form.type = 'delete';
						}}
						type="submit"
						class="primary-btn"
					>
						Delete
					</button>
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
