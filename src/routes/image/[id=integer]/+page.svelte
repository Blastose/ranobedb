<script lang="ts">
	import { buildImageUrl } from '$lib/components/book/book.js';
	import { hasEditPerms } from '$lib/db/permissions.js';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import DbRouteShell from '$lib/components/layout/db/DBRouteShell.svelte';
	import Cover from '$lib/components/image/Cover.svelte';
	import { addToast } from '$lib/components/toast/Toaster.svelte';
	import SubmitButton from '$lib/components/form/SubmitButton.svelte';
	import CheckboxField from '$lib/components/form/CheckboxField.svelte';
	import { superForm } from 'sveltekit-superforms';
	import { getThemeContext, getBgImageStyle } from '$lib/stores/themeStore.js';
	import NoIndex from '$lib/components/layout/NoIndex.svelte';

	let { data } = $props();

	let image = $derived(data.image);
	let books = $derived(data.books);
	let user = $derived(data.user);
	let canEdit = $derived(hasEditPerms(user));
	let imageUrl = $derived(buildImageUrl(image?.filename));

	const theme = getThemeContext();
	let bgImageStyle = $derived(getBgImageStyle($theme, imageUrl));

	// svelte-ignore state_referenced_locally
	const sForm = superForm(data.form, {
		dataType: 'json',
		onUpdated({ form: f }) {
			if (f.message) {
				addToast({ data: { title: f.message.text, type: f.message.type } });
			}
		},
		invalidateAll: 'force',
	});
	const { form, enhance, delayed, submitting } = sForm;
</script>

<PageTitle title="Image {image.id}" />
<NoIndex />

<DbRouteShell theme={$theme} {bgImageStyle}>
	<section class="flex flex-col gap-2">
		<section>
			<p class="capitalize opacity-80">image</p>
			<h1 class="text-2xl font-bold">Image #{image.id}</h1>
		</section>

		<div class="flex flex-col gap-2">
			<section>
				<div class="w-full max-w-60">
					<Cover {image} revealable={true} />
				</div>
			</section>

			<section>
				<dl>
					<div>
						<dt>Image ID</dt>
						<dd>{image.id}</dd>
					</div>
					<div>
						<dt>Filename</dt>
						<dd>{image.filename}</dd>
					</div>
					<div>
						<dt>Dimensions</dt>
						<dd>{image.width} x {image.height}</dd>
					</div>
					{#if books.length > 0}
						<div>
							<dt>Books</dt>
							<dd>
								{#each books as book, index (book.id)}
									<a class="link" href="/book/{book.id}">#{book.id}</a
									>{#if index < books.length - 1}{','}{/if}
								{/each}
							</dd>
						</div>
					{/if}
				</dl>
			</section>

			{#if canEdit}
				<section>
					<h2 class="text-lg font-bold">Content settings</h2>
					<form method="post" use:enhance class="flex flex-col gap-3">
						<CheckboxField
							form={sForm}
							field="nsfw"
							label="NSFW"
							showRequiredSymbolIfRequired={false}
						/>
						<div class="max-w-md">
							<SubmitButton
								delayed={$delayed}
								submitting={$submitting}
								text="Apply content settings"
							/>
						</div>
					</form>
				</section>
			{:else}
				<section>
					<h2 class="text-lg font-bold">Content warnings</h2>
					<dl>
						<div>
							<dt>NSFW</dt>
							<dd>{image.nsfw ? 'Yes' : 'No'}</dd>
						</div>
					</dl>
				</section>
			{/if}
		</div>
	</section>
</DbRouteShell>

<style>
	dl > div {
		display: grid;
		grid-template-columns: 120px 1fr;
	}

	dt {
		font-weight: 700;
	}
</style>
