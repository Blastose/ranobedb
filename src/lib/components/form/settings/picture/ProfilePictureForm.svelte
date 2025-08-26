<script lang="ts">
	import type { profilePictureSchema } from '$lib/server/zod/schema';
	import SuperDebug, {
		fileProxy,
		superForm,
		type Infer,
		type SuperValidated,
	} from 'sveltekit-superforms';
	import SubmitButton from '$lib/components/form/SubmitButton.svelte';
	import { addToast } from '$lib/components/toast/Toaster.svelte';
	import { buildAvatarImageUrl } from '$lib/components/book/book';

	export let profilePictureForm: SuperValidated<Infer<typeof profilePictureSchema>>;

	const sForm = superForm(profilePictureForm);

	const { form, enhance, delayed, submitting, message } = sForm;

	$: if (!$delayed && $message) {
		addToast({ data: { title: $message.text, type: $message.type } });
	}

	const file = fileProxy(form, 'image');

	function clearFileInput() {
		const el = document.querySelector("input[type='file']") as HTMLInputElement | null;
		if (el) {
			el.value = '';
		}
	}
</script>

<!-- <SuperDebug data={$form} /> -->
<section>
	<form
		method="post"
		class="flex flex-col gap-4"
		enctype="multipart/form-data"
		action="?/profilepicture"
		use:enhance
	>
		<div class="flex flex-col gap-2">
			{#if profilePictureForm.data.current_filename}
				<div>
					<p>Current profile picture:</p>
					<div class="flex gap-4">
						{#key profilePictureForm.data.current_filename}
							<div class="max-w-20">
								<img src={buildAvatarImageUrl(profilePictureForm.data.current_filename)} alt="" />
							</div>
							<div class="profile-button">
								<img src={buildAvatarImageUrl(profilePictureForm.data.current_filename)} alt="" />
							</div>
						{/key}
					</div>
				</div>
			{/if}

			<label class="flex flex-col gap-1">
				<span class="font-bold">Upload new image (JPEG, PNG, WEBP; max 3MB).</span>
				<span class="text-sm">Suggested dimensions: 220x220</span>
				<input
					type="file"
					name="image"
					accept="image/png, image/jpeg, image/webp"
					bind:files={$file}
				/>
			</label>
			{#if $file && $file.item && $file.item(0)}
				<p>New image preview:</p>
				<div class="flex gap-2">
					<div class="max-w-36">
						<img src={URL.createObjectURL($file.item(0) ?? new Blob())} alt="" />
					</div>
					<div class="profile-button">
						<img src={URL.createObjectURL($file.item(0) ?? new Blob())} alt="" />
					</div>

					<button
						class="sub-btn h-fit"
						type="button"
						on:click={() => {
							$file = new DataTransfer().files;
							clearFileInput();
						}}>Remove uploaded file</button
					>
				</div>
			{/if}
		</div>

		<SubmitButton
			disabled={!($file && $file.item && $file.item(0))}
			delayed={$delayed}
			submitting={$submitting}
			text={'Upload image'}
		/>
	</form>
</section>
