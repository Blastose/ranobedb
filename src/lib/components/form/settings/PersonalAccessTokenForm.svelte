<script lang="ts">
	import { enhance } from '$app/forms';
	import { addToast } from '$lib/components/toast/Toaster.svelte';
	import SubmitButton from '../SubmitButton.svelte';

	interface Props {
		token?: string;
	}

	let { token = $bindable('') }: Props = $props();

	let submitting = $state(false);
	let currentType: 'password' | 'text' = $state('password');
	let copied = $state(false);

	async function copyToken() {
		if (token) {
			await navigator.clipboard.writeText(token);
			copied = true;
			addToast({ data: { title: 'Copied to clipboard!', type: 'success' } });
			setTimeout(() => (copied = false), 2000);
		}
	}
</script>

<form
	method="POST"
	action="?/refreshpat"
	use:enhance={() => {
		submitting = true;
		return async ({ result }) => {
			submitting = false;
			if (result.type === 'success' && result.data && 'token' in result.data) {
				token = result.data.token as string;
				addToast({ data: { title: 'Token refreshed successfully!', type: 'success' } });
			} else {
				addToast({ data: { title: 'Failed to refresh token.', type: 'error' } });
			}
		};
	}}
	class="flex flex-col gap-2"
>
	<div class="flex flex-col gap-1">
		<div>
			<h2 class="font-bold text-lg">Personal Access Token</h2>
			<p class="text-sm">
				This token is used for external programs to be able to access your library. Keep it secret!
			</p>
		</div>

		<div class="flex flex-col gap-2">
			<div class="flex gap-2">
				<input
					type={token ? currentType : 'password'}
					class="input flex-grow"
					disabled
					value={token}
				/>
				{#if token}
					<button type="button" class="tet-btn w-fit" onclick={copyToken}>
						{copied ? 'Copied!' : 'Copy'}
					</button>
				{/if}
			</div>

			<div class="flex flex-col gap-1">
				{#if token}
					<label class="w-fit flex items-center gap-1">
						<input
							type="checkbox"
							onchange={() => (currentType = currentType === 'password' ? 'text' : 'password')}
						/>
						<span>Show Token</span>
					</label>
				{:else}
					<p class="text-xs sub-text-alt">
						Your token has not been generated yet, Press "Refresh Token" to generate one
					</p>
				{/if}
				<SubmitButton delayed={submitting} {submitting} text={'Refresh Token'} />
			</div>
		</div>
	</div>
</form>
