<script lang="ts">
	import { Dialog } from 'bits-ui';
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

	let open = $state(false);
	let openNested = $state(false);

	// svelte-ignore state_referenced_locally
	const sForm = superForm(userListStaffForm, {
		dataType: 'json',
		onUpdated: async ({ form }) => {
			if (!form.valid) return;

			openNested = false;
			await tick();
			open = false;

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

	let modalTitle = $derived($form.type === 'add' ? 'Follow staff' : 'Update following settings');
	let modalSubmitText = $derived($form.type === 'add' ? 'Follow' : 'Update');
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger
		class="flex items-center gap-2 {$form.type === 'add' ? 'primary-btn' : 'tet-alt-btn'} w-[10rem]"
	>
		{#if $form.type === 'add'}
			<Icon name="accountPlusOutline" height="24" width="24" /><span>Follow</span>
		{:else}
			<Icon name="accountCheckOutline" height="24" width="24" /><span>Following</span>
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
						<div {...props} class="modal-content-inner" transition:fly={{ duration: 250, y: 8 }}>
							<div class="flex flex-col gap-2">
								<div class="flex flex-col">
									<Dialog.Title class="font-medium">{modalTitle}</Dialog.Title>
									<h3 class="text-xl font-bold"><NameDisplay obj={staff}></NameDisplay></h3>
								</div>

								<Dialog.Root bind:open={openNested}>
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

										<div class="flex flex-col justify-end gap-2 sm:flex-row">
											<SubmitButton
												value={$form.type}
												text={modalSubmitText}
												delayed={$delayed && !openNested}
												submitting={$submitting && !openNested}
											/>
											{#if $form.type === 'update'}
												<Dialog.Trigger
													disabled={$submitting}
													type="button"
													class="btn btn-pad whitespace-nowrap">Unfollow</Dialog.Trigger
												>
											{/if}
										</div>
									</form>

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
															<Dialog.Title class="text-lg font-medium">Warning</Dialog.Title>
															<Dialog.Description>
																Are you sure you want to unfollow this staff member?
															</Dialog.Description>

															<form
																action="/api/i/user/staff/{staff.id}"
																method="post"
																use:enhance
																class="mt-6 flex justify-end gap-2"
															>
																<Dialog.Close type="button" class="btn btn-pad">Cancel</Dialog.Close
																>
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
