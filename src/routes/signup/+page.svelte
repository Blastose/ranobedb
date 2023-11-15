<script lang="ts">
	import TextField from '$lib/components/form/TextField.svelte';
	import { superForm } from 'sveltekit-superforms/client';

	export let data;

	const form = superForm(data.form);
</script>

<div class="flex flex-col gap-2">
	<TextField {form} field={'email'} />
	<TextField {form} field={'username'} />
	<TextField {form} field={'password'} />
</div>
