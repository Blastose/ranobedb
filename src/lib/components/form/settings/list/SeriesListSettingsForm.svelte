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
	import { createDialog, melt } from '@melt-ui/svelte';
	import Icon from '$lib/components/icon/Icon.svelte';
	import { fade, fly } from 'svelte/transition';
	import { tick } from 'svelte';

	const {
		elements: { trigger, overlay, content, title, close, portalled, description },
		states: { open },
	} = createDialog({
		forceVisible: true,
		preventScroll: false,
	});

	export let userListSeriesSettingsForm: SuperValidated<Infer<typeof userListSeriesSettingsSchema>>;

	const readingStatuses = defaultUserListLabelsArray.map((v) => {
		return { display: v, value: v };
	});

	const sForm = superForm(userListSeriesSettingsForm, {
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

<form method="post" action="?/serieslistsettings" class="flex flex-col gap-4" use:enhance>
	<div class="flex flex-col gap-2">
		<div>
			<h3 class="font-bold text-lg">Default series list preferences</h3>
			<p class="text-sm">
				Used when automatically adding a series to your list or as the default when adding a series
				to your list manually.
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

<div class="flex justify-center mt-2">
	<button
		use:melt={$trigger}
		class="primary-btn w-full"
		class:loading={$delayed}
		disabled={$submitting}
	>
		{#if !$delayed}
			Save and apply series-release prefs to all series in list
		{:else}
			<Icon name="loading" class="animate-spin" />
		{/if}</button
	>
</div>

{#if $open}
	<div use:melt={$portalled}>
		<div use:melt={$overlay} class="modal-bg" transition:fade={{ duration: 150 }} />
		<div class="modal-content">
			<div
				class="modal-content-inner confirm-modal"
				transition:fly={{
					duration: 250,
					y: 8,
				}}
				use:melt={$content}
			>
				<h2 use:melt={$title} class="text-lg font-medium">Warning</h2>
				<p use:melt={$description}>
					Are you sure you want to apply these series release settings to all series in your list?
					<br />
					This will apply the show upcoming releases and notify releases settings to all series in your
					list and overwrite all current settings.
				</p>
				<form
					action="?/serieslistsettingsapplyall"
					method="post"
					use:enhance
					class="mt-6 flex justify-end gap-2"
				>
					<button type="button" use:melt={$close} class="btn btn-pad">Cancel</button>
					<SubmitButton delayed={$delayed} submitting={$submitting} text="Apply" wFull={false} />
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
