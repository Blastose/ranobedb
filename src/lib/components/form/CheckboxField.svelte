<script lang="ts" context="module">
	type Rec = Record<string, unknown>;
</script>

<script lang="ts" generics="T extends Rec">
	import {
		formFieldProxy,
		type SuperForm,
		type FormPathLeaves,
		type FormFieldProxy,
	} from 'sveltekit-superforms';

	export let form: SuperForm<T, App.Superforms.Message>;
	export let field: FormPathLeaves<T, boolean>;
	export let showRequiredSymbolIfRequired: boolean = true;

	const { value, errors, constraints } = formFieldProxy(
		form,
		field,
	) satisfies FormFieldProxy<boolean>;
	export let label: string = '';
</script>

<div class="flex flex-col gap-1">
	<label class="flex gap-1"
		><input
			name={field}
			type="checkbox"
			class="checkbox"
			bind:checked={$value}
			{...$constraints}
			{...$$restProps}
		/><span
			>{label}{#if $constraints?.required && showRequiredSymbolIfRequired}
				<span class="error-text-color">*</span>
			{/if}</span
		>
	</label>

	{#if $errors}
		<span class="error-text-color">{$errors}</span>
	{/if}
</div>
