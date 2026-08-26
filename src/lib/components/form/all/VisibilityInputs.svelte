<script lang="ts" module>
	type Rec = { hidden: boolean; locked: boolean };
</script>

<script lang="ts" generics="T extends Rec">
	import {
		formFieldProxy,
		type FormFieldProxy,
		type SuperForm,
		type FormPathLeaves,
	} from 'sveltekit-superforms';

	interface Props {
		form: SuperForm<T>;
	}

	let { form }: Props = $props();

	// svelte-ignore state_referenced_locally
	const {
		value: hiddenValue,
		errors: hiddenErrors,
		constraints: hiddenContraints,
	} = formFieldProxy(
		form,
		'hidden' as FormPathLeaves<T, boolean>,
	) satisfies FormFieldProxy<boolean>;

	// svelte-ignore state_referenced_locally
	const {
		value: lockedValue,
		errors: lockedErrors,
		constraints: lockedContraints,
	} = formFieldProxy(
		form,
		'locked' as FormPathLeaves<T, boolean>,
	) satisfies FormFieldProxy<boolean>;

	function handleLockChange(e: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		if (!e.currentTarget.checked) {
			$hiddenValue = false;
		}
	}

	function handleHiddenChange(e: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		if (e.currentTarget.checked) {
			$lockedValue = true;
		}
	}
</script>

<section>
	<h2 class="text-lg font-bold">Visibility</h2>
	<label class="flex gap-1"
		><input type="checkbox" bind:checked={$hiddenValue} onchange={handleHiddenChange} /><span
			>Hidden</span
		></label
	>
	{#if $hiddenErrors}
		<span class="error-text-color">{$hiddenErrors}</span>
	{/if}

	<label class="flex gap-1"
		><input type="checkbox" bind:checked={$lockedValue} onchange={handleLockChange} /><span
			>Locked</span
		></label
	>
	{#if $lockedErrors}
		<span class="error-text-color">{$lockedErrors}</span>
	{/if}
</section>
