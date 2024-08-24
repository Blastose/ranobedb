<script lang="ts">
	import { createDialog, melt } from '@melt-ui/svelte';
	import Icon from '$lib/components/icon/Icon.svelte';
	import { fade, fly } from 'svelte/transition';
	import type { userListSeriesSchema } from '$lib/server/zod/schema';
	import type { Infer, SuperValidated } from 'sveltekit-superforms';
	import { superForm } from 'sveltekit-superforms';
	import SubmitButton from '$lib/components/form/SubmitButton.svelte';
	import { tick } from 'svelte';
	import { addToast } from '$lib/components/toast/Toaster.svelte';
	import {
		defaultUserListLabelsArray,
		languageNames,
		languagesArray,
		releaseFormatArray,
	} from '$lib/db/dbConsts';
	import TitleDisplay from '$lib/components/display/TitleDisplay.svelte';
	import type { Series } from '$lib/server/db/series/series';
	import MultiSelectField from '$lib/components/form/MultiSelectField.svelte';
	import Keyed from '$lib/components/form/Keyed.svelte';
	import SelectField from '$lib/components/form/SelectField.svelte';
	import TextField from '$lib/components/form/TextField.svelte';
	import CheckboxField from '$lib/components/form/CheckboxField.svelte';

	export let series: Series;
	export let userListSeriesForm: SuperValidated<Infer<typeof userListSeriesSchema>>;
	export let allCustLabels: { id: number; label: string }[];

	const readingStatuses = defaultUserListLabelsArray.map((v) => {
		return { display: v, value: v };
	});

	const sForm = superForm(userListSeriesForm, {
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

	$: modalTitle =
		$form.type === 'add' ? 'Add series to reading list' : 'Update series in reading list';
	$: modalSubmitText = $form.type === 'add' ? 'Add to reading list' : 'Update';
</script>

<div class="flex justify-center sm:justify-normal">
	<button use:melt={$trigger} class="primary-btn w-full max-w-xs"
		>{$form.labels.at(0)?.label ?? 'Add to reading list'}</button
	>
</div>

{#if $open}
	<div use:melt={$portalled}>
		<div use:melt={$overlay} class="modal-bg" transition:fade={{ duration: 150 }} />
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
						<h3 class="text-xl font-bold"><TitleDisplay obj={series} /></h3>
					</div>

					<form
						action="/api/i/user/series/{series.id}"
						method="post"
						class="flex flex-col gap-4"
						use:enhance
					>
						<div class="flex flex-wrap gap-x-4 gap-y-2">
							<SelectField
								form={sForm}
								field="readingStatus"
								label="Reading status"
								dropdownOptions={readingStatuses}
								showRequiredSymbolIfRequired={false}
								selectedValue={$form.readingStatus}
								resetPadding={true}
								fit={true}
							/>

							<div class="series-modal-volumes-read">
								<TextField
									form={sForm}
									field="volumes_read"
									label="Volumes read"
									type="number"
									resetPadding={true}
								/>
							</div>
						</div>

						<div class="max-w-sm">
							<MultiSelectField
								form={sForm}
								field="selectedCustLabels"
								noneSelectedText="none"
								allSelectedText={undefined}
								labelText="Custom labels"
								dropdownOptions={allCustLabels.map((v) => ({
									display: v.label,
									value: v.id,
								}))}
							/>
						</div>

						<div>
							<CheckboxField form={sForm} field="show_upcoming" label="Show upcoming releases" />

							{#if $form.show_upcoming}
								<p>Show upcoming releases when:</p>
								<div class="flex flex-wrap gap-x-2">
									<div class="max-w-fit">
										<Keyed>
											<MultiSelectField
												form={sForm}
												field="langs"
												noneSelectedText="any"
												allSelectedText="any"
												labelText="Release language is one of"
												dropdownOptions={languagesArray.map((v) => ({
													display: languageNames[v],
													value: v,
												}))}
											/>
										</Keyed>
									</div>
									<div class="max-w-fit">
										<Keyed>
											<MultiSelectField
												form={sForm}
												field="formats"
												noneSelectedText="any"
												allSelectedText="any"
												labelText="Release format is one of"
												dropdownOptions={releaseFormatArray.map((v) => ({
													display: v,
													value: v,
												}))}
											/>
										</Keyed>
									</div>
								</div>
							{/if}
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
						<div use:melt={$overlayNested} class="modal-bg" transition:fade={{ duration: 150 }} />
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
									Are you sure you want to remove this series from your list?
									<span class="text-sm"
										>Removing this series will also remove any associated books and releases you
										have added to your list.</span
									>
								</p>

								<form
									action="/api/i/user/series/{series.id}"
									method="post"
									use:enhance
									class="mt-6 flex justify-end gap-2"
								>
									<button type="button" use:melt={$closeNested} class="btn btn-pad">Cancel</button>
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

	.series-modal-volumes-read :global(input) {
		max-width: 72px;
	}
</style>
