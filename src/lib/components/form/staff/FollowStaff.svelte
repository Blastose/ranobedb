<script lang="ts">
	import { createDialog, melt } from '@melt-ui/svelte';
	import Icon from '$lib/components/icon/Icon.svelte';
	import { fade, fly } from 'svelte/transition';
	import type { userListStaffSchema } from '$lib/server/zod/schema';
	import type { Infer, SuperValidated } from 'sveltekit-superforms';
	import { superForm } from 'sveltekit-superforms';
	import SubmitButton from '$lib/components/form/SubmitButton.svelte';
	import { tick } from 'svelte';
	import { addToast } from '$lib/components/toast/Toaster.svelte';
	import { languageNames, languagesArray, releaseFormatArray } from '$lib/db/dbConsts';
	import MultiSelectField from '$lib/components/form/MultiSelectField.svelte';
	import Keyed from '$lib/components/form/Keyed.svelte';
	import CheckboxField from '$lib/components/form/CheckboxField.svelte';
	import type { Staff } from '$lib/server/db/staff/staff';
	import NameDisplay from '$lib/components/display/NameDisplay.svelte';

	interface Props {
		staff: Staff;
		userListStaffForm: SuperValidated<Infer<typeof userListStaffSchema>>;
	}

	let { staff, userListStaffForm }: Props = $props();

	const sForm = superForm(userListStaffForm, {
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

	let modalTitle = $derived($form.type === 'add' ? 'Follow staff' : 'Update following settings');
	let modalSubmitText = $derived($form.type === 'add' ? 'Follow' : 'Update');
</script>

<div class="flex">
	<button use:melt={$trigger} class="primary-btn w-full max-w-[10rem]"
		>{$form.type === 'add' ? 'Follow' : 'Following'}</button
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
						<h3 class="text-xl font-bold"><NameDisplay obj={staff}></NameDisplay></h3>
					</div>

					<form
						action="/api/i/user/staff/{staff.id}"
						method="post"
						class="flex flex-col gap-4"
						use:enhance
					>
						<div>
							<p>Notify me when a new release is added when:</p>
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
							<div class="pt-1">
								<CheckboxField
									form={sForm}
									field="only_first_book"
									label="Only notify me when a release is added to the first book in the series"
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
									class="whitespace-nowrap btn btn-pad">Unfollow</button
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
									Are you sure you want to unfollow this staff member?
								</p>

								<form
									action="/api/i/user/staff/{staff.id}"
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
										Unfollow
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
