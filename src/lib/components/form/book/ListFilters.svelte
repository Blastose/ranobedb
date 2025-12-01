<script lang="ts">
	import { addToast } from '$lib/components/toast/Toaster.svelte';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import SubmitButton from '$lib/components/form/SubmitButton.svelte';
	import { createDialog, melt } from '@melt-ui/svelte';
	import Icon from '$lib/components/icon/Icon.svelte';
	import { fade, fly } from 'svelte/transition';
	import { tick } from 'svelte';
	import type { listFiltersSchema } from '$lib/server/zod/schema';
	import HiddenInput from '../HiddenInput.svelte';

	const {
		elements: { trigger, overlay, content, title, close, portalled, description },
		states: { open },
	} = createDialog({
		forceVisible: true,
		preventScroll: false,
	});

	export let searchParams: SuperValidated<Infer<typeof listFiltersSchema>>;

	const sForm = superForm(searchParams, {
		dataType: 'json',
		onUpdated: async ({ form }) => {
			if (!form.valid) return;
			await tick();
			open.set(false);
			addToast({
				data: {
					title: form.message?.text ?? 'Success',
					type: 'success',
				},
			});
		},
		invalidateAll: 'force',
	});
	const { form, enhance, delayed, submitting, message } = sForm;
</script>

<div>
	<button use:melt={$trigger} class="sub-btn w-fit" class:loading={$delayed} disabled={$submitting}>
		{#if !$delayed}
			Save current filters as default
		{:else}
			<Icon name="loading" class="animate-spin" />
		{/if}</button
	>
</div>

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
					Are you sure you want to save the current filters as the default?
					<br />
					If you have just changed the filters, make sure to click the filter button before saving.
				</p>
				<form
					action="/api/i/user/filters"
					method="post"
					use:enhance
					class="mt-6 flex justify-end gap-2"
				>
					<HiddenInput name="filters" value={searchParams.data.filters} />
					<HiddenInput name="target" value={searchParams.data.target} />
					<HiddenInput name="is_list" value={searchParams.data.is_list} />
					<button type="button" use:melt={$close} class="btn btn-pad">Cancel</button>
					<SubmitButton delayed={$delayed} submitting={$submitting} text="Save" wFull={false} />
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
