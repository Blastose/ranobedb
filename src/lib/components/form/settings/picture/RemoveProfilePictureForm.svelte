<script lang="ts">
	import type { removeProfilePictureSchema } from '$lib/server/zod/schema';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import SubmitButton from '$lib/components/form/SubmitButton.svelte';
	import Hr from '$lib/components/layout/Hr.svelte';
	import { Dialog } from 'bits-ui';
	import { fade, fly } from 'svelte/transition';
	import { tick } from 'svelte';
	import Icon from '$lib/components/icon/Icon.svelte';
	import { addToast } from '$lib/components/toast/Toaster.svelte';

	interface Props {
		removeProfilePictureForm: SuperValidated<Infer<typeof removeProfilePictureSchema>>;
	}

	let { removeProfilePictureForm }: Props = $props();
	let open = $state(false);

	// svelte-ignore state_referenced_locally
	const sForm = superForm(removeProfilePictureForm, {
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
					type: form.message?.type ?? 'error',
				},
			});
		},
		invalidateAll: 'force',
	});

	const { form, enhance, delayed, submitting, message } = sForm;
</script>

{#if removeProfilePictureForm.data.current_filename}
	<Dialog.Root bind:open>
		<Hr />

		<section class="flex flex-col gap-2">
			<p class="font-bold">Remove profile picture</p>

			<Dialog.Trigger
				type="button"
				class="primary-btn w-full {$delayed ? 'loading' : ''}"
				disabled={$submitting}
			>
				{#if !$delayed}
					Remove profile picture
				{:else}
					<Icon name="loading" class="animate-spin" />
				{/if}
			</Dialog.Trigger>

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
									<Dialog.Description>
										Are you sure you want to remove your current profile picture?
									</Dialog.Description>
									<form
										action="?/removeprofilepicture"
										method="post"
										use:enhance
										class="mt-6 flex justify-end gap-2"
									>
										<Dialog.Close type="button" class="btn btn-pad">Cancel</Dialog.Close>
										<SubmitButton
											delayed={$delayed}
											submitting={$submitting}
											text="Remove profile picture"
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
		</section>
	</Dialog.Root>
{/if}

<style>
	.modal-content-inner.confirm-modal {
		max-width: 512px;
	}
</style>
