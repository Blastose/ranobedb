<script lang="ts">
	import { addToast } from '$lib/components/toast/Toaster.svelte';
	import { superForm, type Infer, type SuperValidated, formFieldProxy } from 'sveltekit-superforms';
	import SubmitButton from '$lib/components/form/SubmitButton.svelte';
	import { Dialog } from 'bits-ui';
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

	let open = $state(false);
	let openNested = $state(false);

	// svelte-ignore state_referenced_locally
	const sForm = superForm(searchParams, {
		dataType: 'json',
		onUpdate: async ({ form }) => {
			if (form.message?.type === 'success') {
				open = false;
				await tick();
			}
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
			openNested = false;
			await tick();
			deleting = false;
			deleteTarget = null;
			open = false;
		}
	}

	let nameExists = $derived(savedFilters.some((sf) => sf.name === $nameValue));
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger class="sub-btn w-fit">Manage saved filters</Dialog.Trigger>
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
							<Dialog.Title class="mb-2 text-lg font-bold">Saved filters</Dialog.Title>

							<div class=" flex flex-col gap-4">
								<Dialog.Root bind:open={openNested}>
									{#if savedFilters.length > 0}
										<div class="thin-scrollbar max-h-60 overflow-y-auto">
											{#each savedFilters as sf (sf.name)}
												<div class="flex items-center justify-between gap-2 rounded px-2 py-1">
													<a
														href="?{sf.filters}"
														class="link line-clamp-1"
														onclick={() => {
															open = false;
														}}>{sf.name}</a
													>
													<div class="flex items-center gap-1 whitespace-nowrap">
														<button
															type="button"
															class="btn rounded-full px-2 text-sm"
															onclick={() => {
																deleteTarget = sf.name;
																openNested = true;
															}}
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
															<Dialog.Title class="text-lg font-medium">Delete filter</Dialog.Title>
															<Dialog.Description>
																Are you sure you want to delete the filter "{deleteTarget}"?
															</Dialog.Description>
															<div class="mt-6 flex justify-end gap-2">
																<Dialog.Close type="button" class="btn btn-pad">Cancel</Dialog.Close
																>
																<button
																	type="button"
																	class="primary-btn"
																	onclick={confirmDelete}
																	disabled={deleting}
																>
																	{#if deleting}
																		<Icon name="loading" class="animate-spin" />
																	{:else}
																		Delete
																	{/if}
																</button>
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

								<Hr />

								<form
									action="/api/i/user/filters"
									method="post"
									use:enhance
									class="flex flex-col gap-2"
								>
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
											If you have just changed the filters, make sure to apply the filters by clicking
											the search button before saving them.
										</p>
										<p class="text-xs">
											Using the name "{defaultFilterName}" will auto-apply these filters when you
											visit this page. Other names let you save multiple presets that you can load
											manually from the list.
										</p>
										{#if nameExists}
											<p class="error-text-color text-xs">
												Existing filter "{$nameValue}" will be overwritten if saved.
											</p>
										{:else}
											<p class="text-xs">
												You can also overwrite an existing filter by using the same name.
											</p>
										{/if}
										<div class="flex justify-end gap-2">
											<Dialog.Close class="btn btn-pad">Close</Dialog.Close>
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
