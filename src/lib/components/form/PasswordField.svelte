<script lang="ts" module>
	type Rec = Record<string, unknown>;
</script>

<script lang="ts" generics="T extends Rec">
	import { formFieldProxy, type SuperForm, type FormPathLeaves } from 'sveltekit-superforms';

	interface Props {
		form: SuperForm<T, App.Superforms.Message>;
		field: FormPathLeaves<T>;
		label?: string;
		placeholder?: string;
		showRequiredSymbolIfRequired?: boolean;
		resetPadding?: boolean;
		disabled?: boolean;
	}

	let {
		form,
		field,
		label = '',
		placeholder = '',
		showRequiredSymbolIfRequired = true,
		resetPadding = false,
		disabled = false,
		...rest
	}: Props = $props();

	// svelte-ignore state_referenced_locally
	const { value, errors, constraints } = formFieldProxy(form, field);

	let currentType: 'password' | 'text' = $state('password');

	function toggleType() {
		if (currentType === 'password') {
			currentType = 'text';
		} else {
			currentType = 'password';
		}
	}

	function handleShowPasswordCheck(
		event: MouseEvent & { currentTarget: EventTarget & HTMLInputElement },
	) {
		toggleType();
	}
</script>

<div class="flex flex-col gap-1">
	<label class="flex flex-col gap-1">
		<span>
			<span class="dark:text-[var(--text-dark)]">{label || String(field)}</span>
			{#if $constraints?.required && showRequiredSymbolIfRequired}
				<span class="error-text-color">*</span>
			{/if}
		</span>
		<input
			{...{ type: currentType }}
			name={field}
			{placeholder}
			{disabled}
			class="input"
			class:reset-padding={resetPadding}
			class:error={$errors}
			aria-invalid={$errors ? 'true' : undefined}
			bind:value={$value}
			{...$constraints}
			{...rest}
		/>
	</label>
	<label class="w-fit">
		<input type="checkbox" onclick={handleShowPasswordCheck} />
		<span>Show password</span>
	</label>
	{#if $errors}
		<span class="error-text-color">{$errors}</span>
	{/if}
</div>

<style>
	.input:disabled {
		background-color: unset;
	}
</style>
