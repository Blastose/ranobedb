<script lang="ts">
	import { addToast } from '$lib/components/toast/Toaster.svelte';
	import { superForm, type Infer, type SuperValidated, formFieldProxy } from 'sveltekit-superforms';
	import SubmitButton from '$lib/components/form/SubmitButton.svelte';
	import { createDialog, melt } from '@melt-ui/svelte';
	import Icon from '$lib/components/icon/Icon.svelte';
	import { fade, fly } from 'svelte/transition';
	import { tick } from 'svelte';
	import type { listFiltersSchema, SavedFilterEntry } from '$lib/server/zod/schema';
	import HiddenInput from '../HiddenInput.svelte';
	import { defaultFilterName } from '$lib/db/dbConsts';
	import TextField from '../TextField.svelte';
	import { invalidateAll } from '$app/navigation';
	import Hr from '$lib/components/layout/Hr.svelte';

	interface Props {
		searchParams: SuperValidated<Infer<typeof listFiltersSchema>>;
		savedFilters: SavedFilterEntry[];
	}
	let { searchParams, savedFilters }: Props = $props();

	const {
		elements: { trigger, overlay, content, title, close, portalled, description },
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
	} = createDialog({
		forceVisible: true,
		preventScroll: false,
	});

	// svelte-ignore state_referenced_locally
	const sForm = superForm(searchParams, {
		dataType: 'json',
		onUpdate: async ({ form }) => {
			if (form.message?.type === 'success') {
				open.set(false);
				await tick();
			}
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
	const { value: nameValue } = formFieldProxy(sForm, 'name');

	let deleteTarget = $state<string | null>(null);
	let deleting = $state(false);

	async function confirmDelete() {
		if (!deleteTarget) {
			return;
		}
		deleting = true;
		try {
			const formData = new FormData();
			formData.set('target', searchParams.data.target);
			formData.set('is_list', String(searchParams.data.is_list));
			formData.set('name', deleteTarget);
			const res = await (
				await fetch('/api/i/user/filters/delete', { method: 'POST', body: formData })
			).json();
			if ('status' in res && res.status === 200) {
				addToast({ data: { title: `Filter ${deleteTarget} deleted`, type: 'success' } });
				await invalidateAll();
				await tick();
			} else {
				addToast({ data: { title: 'Failed to delete filter', type: 'error' } });
			}
		} finally {
			deleting = false;
			deleteTarget = null;
			openNested.set(false);
			open.set(false);
		}
	}

	let nameExists = $derived(savedFilters.some((sf) => sf.name === $nameValue));
</script>

<div>
	<button use:melt={$trigger} class="sub-btn w-fit">Manage saved filters</button>
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
				<h2 use:melt={$title} class="text-lg font-bold mb-2">Saved filters</h2>

				<div class=" flex flex-col gap-4">
					{#if savedFilters.length > 0}
						<div class="max-h-60 overflow-y-auto thin-scrollbar">
							{#each savedFilters as sf (sf.name)}
								<div class="flex items-center justify-between gap-2 rounded px-2 py-1">
									<a
										href="?{sf.filters}"
										class="link line-clamp-1"
										onclick={() => {
											open.set(false);
										}}>{sf.name}</a
									>
									<div class="flex items-center gap-1 whitespace-nowrap">
										<button
											type="button"
											class="text-sm btn rounded-full px-2"
											use:melt={$triggerNested}
											onclick={() => (deleteTarget = sf.name)}
										>
											Delete
										</button>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<p>No saved filters</p>
					{/if}

					<Hr />

					<form action="/api/i/user/filters" method="post" use:enhance class="flex flex-col gap-2">
						<HiddenInput name="filters" value={searchParams.data.filters} />
						<HiddenInput name="target" value={searchParams.data.target} />
						<HiddenInput name="is_list" value={searchParams.data.is_list} />
						<div>
							<p class="font-semibold">Save new filter</p>
							<TextField
								form={sForm}
								field="name"
								label="Filter name"
								showRequiredSymbolIfRequired={false}
							/>
						</div>

						<div>
							<p class="text-xs">
								{#if searchParams.data.target === 'release'}
									These filters will also apply to the releases on the home page.
									<br />
								{/if}
								If you have just changed the filters, make sure to apply the filters by clicking the search
								button before saving them.
							</p>
							<p class="text-xs">
								Using the name "{defaultFilterName}" will auto-apply these filters when you visit
								this page. Other names let you save multiple presets that you can load manually from
								the list.
							</p>
							{#if nameExists}
								<p class="text-xs error-text-color">
									Existing filter "{$nameValue}" will be overwritten if saved.
								</p>
							{:else}
								<p class="text-xs">
									You can also overwrite an existing filter by using the same name.
								</p>
							{/if}
							<div class="flex justify-end gap-2">
								<button type="button" use:melt={$close} class="btn btn-pad">Close</button>
								<SubmitButton
									delayed={$delayed}
									submitting={$submitting}
									text="Save"
									wFull={false}
								/>
							</div>
						</div>
					</form>
				</div>

				<button use:melt={$close} aria-label="close" class="close-btn btn">
					<Icon name="close" />
				</button>
			</div>
		</div>
	</div>
{/if}

{#if $openNested}
	<div use:melt={$portalledNested}>
		<div use:melt={$overlayNested} class="modal-bg" transition:fade={{ duration: 150 }}></div>
		<div class="modal-content">
			<div
				class="modal-content-inner confirm-modal"
				transition:fly={{
					duration: 250,
					y: 8,
				}}
				use:melt={$contentNested}
			>
				<h2 use:melt={$titleNested} class="text-lg font-medium">Delete filter</h2>
				<p use:melt={$descriptionNested}>
					Are you sure you want to delete the filter "{deleteTarget}"?
				</p>
				<div class="mt-6 flex justify-end gap-2">
					<button type="button" use:melt={$closeNested} class="btn btn-pad">Cancel</button>
					<button type="button" class="primary-btn" onclick={confirmDelete} disabled={deleting}>
						{#if deleting}
							<Icon name="loading" class="animate-spin" />
						{:else}
							Delete
						{/if}
					</button>
				</div>
				<button use:melt={$closeNested} aria-label="close" class="close-btn btn">
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
