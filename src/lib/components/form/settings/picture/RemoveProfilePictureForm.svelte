<script lang="ts">
	import type { removeProfilePictureSchema } from '$lib/server/zod/schema';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import SubmitButton from '$lib/components/form/SubmitButton.svelte';
	import Hr from '$lib/components/layout/Hr.svelte';
	import { createDialog, melt } from '@melt-ui/svelte';
	import { fade, fly } from 'svelte/transition';
	import { tick } from 'svelte';
	import Icon from '$lib/components/icon/Icon.svelte';
	import { addToast } from '$lib/components/toast/Toaster.svelte';

	export let removeProfilePictureForm: SuperValidated<Infer<typeof removeProfilePictureSchema>>;

	const sForm = superForm(removeProfilePictureForm, {
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

	const {
		elements: { trigger, overlay, content, title, close, portalled, description },
		states: { open },
	} = createDialog({
		forceVisible: true,
		preventScroll: false,
	});
</script>

{#if removeProfilePictureForm.data.current_filename}
	<Hr />

	<section class="flex flex-col gap-2">
		<p class="font-bold">Remove profile picture</p>

		<button
			use:melt={$trigger}
			class="primary-btn w-full"
			type="button"
			class:loading={$delayed}
			disabled={$submitting}
		>
			{#if !$delayed}
				Remove profile picture
			{:else}
				<Icon name="loading" class="animate-spin" />
			{/if}</button
		>

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
						<h2 use:melt={$title} class="text-lg font-medium">Confirm</h2>
						<p use:melt={$description}>
							Are you sure you want to remove your current profile picture?
						</p>
						<form
							action="?/removeprofilepicture"
							method="post"
							use:enhance
							class="mt-6 flex justify-end gap-2"
						>
							<button type="button" use:melt={$close} class="btn btn-pad">Cancel</button>
							<SubmitButton
								delayed={$delayed}
								submitting={$submitting}
								text="Remove profile picture"
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
	</section>
{/if}

<style>
	.modal-content-inner.confirm-modal {
		max-width: 512px;
	}
</style>
