<script lang="ts">
	import { enhance } from '$app/forms';

	export let action: string | null = null;
	export let loading: boolean;
</script>

<form
	method="POST"
	{action}
	use:enhance={() => {
		loading = true;
		return async ({ result, update }) => {
			if (result.type === 'redirect') {
				window.location.href = result.location;
				return;
			}
			loading = false;
			update();
		};
	}}
>
	<div class="flex flex-col gap-4">
		<slot name="form-input" />
		<slot name="form-submit" />
	</div>
</form>
