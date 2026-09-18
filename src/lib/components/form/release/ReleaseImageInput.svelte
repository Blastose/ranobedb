<script lang="ts" module>
	export type RelatedReleaseImage = {
		release_id: number;
		title: string;
		romaji: string | null;
		lang: Language;
		format: string;
		id: number;
		filename: string;
		width: number;
		height: number;
		nsfw: boolean;
	};

	type ImagePreview = Pick<RelatedReleaseImage, 'id' | 'filename' | 'width' | 'height' | 'nsfw'>;
</script>

<script lang="ts">
	import { onDestroy } from 'svelte';
	import { fileProxy, type Infer, type SuperForm } from 'sveltekit-superforms';
	import type { releaseSchema } from '$lib/server/zod/schema';
	import type { ReleaseEdit } from '$lib/server/db/releases/releases';
	import Cover from '$lib/components/image/Cover.svelte';
	import CheckboxField from '../CheckboxField.svelte';
	import TextField from '../TextField.svelte';
	import ReleaseTitleDisplay from '$lib/components/display/ReleaseTitleDisplay.svelte';
	import type { Language } from '$lib/server/db/dbTypes';
	import { browser } from '$app/environment';

	const COLLAPSED_COVER_COUNT = 4;
	const IMAGE_PREVIEW_DEBOUNCE_MS = 300;

	type ReleaseImage = Pick<ReleaseEdit, 'image_id' | 'image_obj'>;
	type ManualImagePreviewState =
		| { status: 'idle' }
		| { status: 'loading' }
		| { status: 'loaded'; image: ImagePreview }
		| { status: 'error' };

	interface Props {
		form: SuperForm<Infer<typeof releaseSchema>, App.Superforms.Message>;
		release: ReleaseImage | undefined;
		relatedReleaseImages?: RelatedReleaseImage[];
	}

	let { form, release, relatedReleaseImages = [] }: Props = $props();

	// svelte-ignore state_referenced_locally
	const { form: formData, errors } = form;
	// svelte-ignore state_referenced_locally
	const file = fileProxy(form, 'image');

	let fileInput: HTMLInputElement;
	let selectedFile = $derived(browser ? ($file?.item(0) ?? null) : null);
	let showAllReleaseImages = $state(false);
	let visibleReleaseImages = $derived(
		showAllReleaseImages
			? relatedReleaseImages
			: relatedReleaseImages.slice(0, COLLAPSED_COVER_COUNT),
	);
	let manualImagePreview = $state<ManualImagePreviewState>({ status: 'idle' });
	let manualImagePreviewTimeout: ReturnType<typeof setTimeout> | undefined;
	let manualImagePreviewController: AbortController | undefined;

	function uploadedImagePreview(image: File) {
		return (node: HTMLImageElement) => {
			const url = URL.createObjectURL(image);
			node.src = url;

			return () => URL.revokeObjectURL(url);
		};
	}

	function cancelManualImagePreviewRequest() {
		if (manualImagePreviewTimeout) clearTimeout(manualImagePreviewTimeout);
		manualImagePreviewController?.abort();
		manualImagePreviewTimeout = undefined;
		manualImagePreviewController = undefined;
	}

	function clearManualImagePreview() {
		cancelManualImagePreviewRequest();
		manualImagePreview = { status: 'idle' };
	}

	function onImageIdInput(event: Event) {
		const imageId = (event.currentTarget as HTMLInputElement).valueAsNumber;
		clearManualImagePreview();

		const existingImage = relatedReleaseImages.find((image) => image.id === imageId);
		if (existingImage) {
			manualImagePreview = { status: 'loaded', image: existingImage };
			return;
		}

		manualImagePreview = { status: 'loading' };
		manualImagePreviewController = new AbortController();
		const signal = manualImagePreviewController.signal;
		manualImagePreviewTimeout = setTimeout(async () => {
			try {
				const response = await fetch(`/api/i/image/${imageId}`, { signal: signal });
				if (signal.aborted) return;
				if (!response.ok) {
					manualImagePreview = { status: 'error' };
					return;
				}
				const image = (await response.json()) as ImagePreview;
				if (!signal.aborted) {
					manualImagePreview = { status: 'loaded', image };
				}
			} catch {
				if (!signal.aborted) {
					manualImagePreview = { status: 'error' };
				}
			}
		}, IMAGE_PREVIEW_DEBOUNCE_MS);
	}

	function clearManualImage() {
		$formData.image_id_manual = null;
		clearManualImagePreview();
	}

	function clearFileInput() {
		$file = new DataTransfer().files;
		fileInput.value = '';
	}

	function selectExistingImage(image: RelatedReleaseImage) {
		clearFileInput();
		$formData.remove_image = false;
		if ($formData.image_id_manual === image.id) {
			clearManualImage();
			return;
		}

		cancelManualImagePreviewRequest();
		$formData.image_id_manual = image.id;
		manualImagePreview = { status: 'loaded', image };
	}

	onDestroy(cancelManualImagePreviewRequest);
</script>

<section class="flex flex-col gap-2">
	<div>
		<h2 class="text-xl font-bold">Cover image</h2>
		{#if release?.image_id && release.image_obj}
			<p>Current image</p>
			<p>Image ID: {release.image_obj.id}</p>
			<div class="w-36">
				<Cover image={release.image_obj} revealable={true} />
			</div>
			{#if !selectedFile && !$formData.image_id_manual}
				<div class="pt-2">
					<CheckboxField
						{form}
						field="remove_image"
						label="Remove cover image"
						showRequiredSymbolIfRequired={false}
					/>
				</div>
			{/if}
		{:else}
			<p>Currently no cover image</p>
		{/if}
	</div>

	<div>
		{#if relatedReleaseImages.length > 0}
			<div class="mb-4 flex flex-col gap-2">
				<h3 class="font-bold">Reuse a cover from another release</h3>
				<div class="grid grid-cols-2 gap-2 @sm:grid-cols-3 @md:grid-cols-4">
					{#each visibleReleaseImages as image (image.release_id)}
						<button
							type="button"
							aria-pressed={$formData.image_id_manual === image.id}
							class="link-box flex flex-col items-center gap-1 p-2 text-left {$formData.image_id_manual ===
							image.id
								? 'ring-2 ring-[var(--primary-500)]'
								: ''}"
							onclick={() => selectExistingImage(image)}
						>
							<div class="w-full max-w-24 self-center">
								<Cover {image} useDefaultCoverAspectRatio={true} />
							</div>
							<span class="line-clamp-1 text-sm font-bold"><ReleaseTitleDisplay obj={image} /></span
							>
						</button>
					{/each}
				</div>
				{#if relatedReleaseImages.length > COLLAPSED_COVER_COUNT}
					<button
						type="button"
						class="sub-btn w-fit text-sm"
						onclick={() => (showAllReleaseImages = !showAllReleaseImages)}
					>
						{showAllReleaseImages
							? 'Show fewer covers'
							: `Show ${relatedReleaseImages.length - COLLAPSED_COVER_COUNT} more`}
					</button>
				{/if}
			</div>
		{/if}

		<label class="flex flex-col gap-1">
			<span>Upload new image (JPEG, PNG, WEBP; max 10MB)</span>
			<input
				bind:this={fileInput}
				type="file"
				name="image"
				accept="image/png, image/jpeg, image/webp"
				bind:files={$file}
				disabled={Boolean($formData.image_id_manual) || Boolean($formData.remove_image)}
			/>
		</label>
		{#if selectedFile}
			<p>New image preview</p>
			<div class="flex gap-2">
				<div class="max-w-36">
					<img {@attach uploadedImagePreview(selectedFile)} alt="" />
				</div>
				<button class="sub-btn h-fit" type="button" onclick={clearFileInput}
					>Remove uploaded file</button
				>
			</div>
			<div class="pt-1">
				<CheckboxField
					{form}
					field="image_nsfw"
					label="Mark image as NSFW"
					showRequiredSymbolIfRequired={false}
				/>
			</div>
		{/if}

		{#if $errors.image}<span class="error-text-color">{$errors.image}</span>{/if}

		{#if !selectedFile}
			<p>or</p>
			<div class="w-fit">
				<TextField
					{form}
					type="number"
					field="image_id_manual"
					label="Use existing image from image ID"
					disabled={Boolean($formData.remove_image)}
					resetPadding={true}
					oninput={onImageIdInput}
				/>
			</div>

			{#if $formData.image_id_manual}
				<p>Image preview</p>
				<div class="flex items-start gap-2">
					{#if manualImagePreview.status === 'loaded'}
						<div class="w-36 shrink-0">
							<Cover image={manualImagePreview.image} revealable={true} />
						</div>
					{:else if manualImagePreview.status === 'loading'}
						<p class="text-sub text-sm">Loading image...</p>
					{:else if manualImagePreview.status === 'error'}
						<p class="error-text-color text-sm">Image not found</p>
					{/if}
					<button class="sub-btn" type="button" onclick={clearManualImage}>Clear image</button>
				</div>
			{/if}
		{/if}
	</div>
</section>
