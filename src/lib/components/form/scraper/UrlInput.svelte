<script lang="ts">
	import TextField from '$lib/components/form/TextField.svelte';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { addToast } from '$lib/components/toast/Toaster.svelte';
	import SubmitButton from '$lib/components/form/SubmitButton.svelte';
	import type { bookWalkerScraperUrlSchema } from '$lib/server/scraper/bookwalker/bookwalker-scraper';

	export let urlForm: SuperValidated<Infer<typeof bookWalkerScraperUrlSchema>>;

	const form = superForm(urlForm, {
		onUpdated({ form: f }) {
			if (!f.valid) {
				addToast({ data: { title: f.message?.text || 'Error in form!', type: 'error' } });
			}
		},
	});
	const { enhance, message, delayed, submitting } = form;
</script>

<form method="POST" action="/add/get-data" use:enhance>
	<div class="flex flex-col gap-2">
		<div class="w-full @md:w-3/4">
			<TextField {form} field={'url'} placeholder="" label="BookWalker JP URL" />
		</div>

		<div class="w-fit">
			<SubmitButton submitting={$submitting} delayed={$delayed} text={'Fetch data'} wFull={false} />
		</div>
	</div>
</form>
