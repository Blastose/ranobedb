<script lang="ts">
	import { addToast } from '$lib/components/toast/Toaster.svelte';
	import type { userListSeriesSettingsSchema } from '$lib/server/zod/schema';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import SelectField from '../../SelectField.svelte';
	import SubmitButton from '../../SubmitButton.svelte';
	import Keyed from '../../Keyed.svelte';
	import {
		defaultUserListLabelsArray,
		languageNames,
		languagesArray,
		releaseFormatArray,
	} from '$lib/db/dbConsts';
	import MultiSelectField from '../../MultiSelectField.svelte';
	import CheckboxField from '../../CheckboxField.svelte';
	import { Dialog } from 'bits-ui';
	import Icon from '$lib/components/icon/Icon.svelte';
	import { fade, fly } from 'svelte/transition';
	import { tick } from 'svelte';

	interface Props {
		userListSeriesSettingsForm: SuperValidated<Infer<typeof userListSeriesSettingsSchema>>;
	}

	let { userListSeriesSettingsForm }: Props = $props();

	let open = $state(false);

	const readingStatuses = defaultUserListLabelsArray.map((v) => {
		return { display: v, value: v };
	});

	// svelte-ignore state_referenced_locally
	const sForm = superForm(userListSeriesSettingsForm, {
		dataType: 'json',
		onUpdated: async ({ form }) => {
			if (!form.valid) return;
			await tick();
			open = false;
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

<Dialog.Root bind:open>
	<form method="post" action="?/serieslistsettings" class="flex flex-col gap-4" use:enhance>
		<div class="flex flex-col gap-2">
			<div>
				<h3 class="text-lg font-bold">Default series list preferences</h3>
				<p class="text-sm">
					Used when automatically adding a series to your list or as the default when adding a
					series to your list manually.
				</p>
			</div>

			<div class="flex flex-wrap gap-x-4 gap-y-2">
				<SelectField
					form={sForm}
					field="readingStatus"
					label="Default reading status"
					dropdownOptions={readingStatuses}
					showRequiredSymbolIfRequired={false}
					selectedValue={$form.readingStatus}
					resetPadding={true}
					fit={true}
				/>
			</div>

			<div>
				<CheckboxField form={sForm} field="show_upcoming" label="Show upcoming releases" />

				{#if $form.show_upcoming}
					<CheckboxField
						form={sForm}
						field="notify_book"
						label="Also notify me when a new release is added"
					/>
					<CheckboxField
						form={sForm}
						field="notify_when_released"
						label="Also notify me when a release has been released"
					/>
					<p>When:</p>
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
		</div>
		<SubmitButton delayed={$delayed} submitting={$submitting} text={'Save preferences'} />
	</form>

	<div class="mt-2 flex justify-center">
		<Dialog.Trigger
			type="button"
			class="primary-btn w-full {$delayed ? 'loading' : ''}"
			disabled={$submitting}
		>
			{#if !$delayed}
				Save and apply series-release prefs to all series in list
			{:else}
				<Icon name="loading" class="animate-spin" />
			{/if}
		</Dialog.Trigger>
	</div>

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
								Are you sure you want to apply these series release settings to all series in your
								list?
								<br />
								This will apply the show upcoming releases and notify releases settings to all series
								in your list and overwrite all current settings.
							</Dialog.Description>
							<form
								action="?/serieslistsettingsapplyall"
								method="post"
								use:enhance
								class="mt-6 flex justify-end gap-2"
							>
								<Dialog.Close type="button" class="btn btn-pad">Cancel</Dialog.Close>
								<SubmitButton
									delayed={$delayed}
									submitting={$submitting}
									text="Apply"
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
</Dialog.Root>

<style>
	.modal-content-inner.confirm-modal {
		max-width: 512px;
	}
</style>
