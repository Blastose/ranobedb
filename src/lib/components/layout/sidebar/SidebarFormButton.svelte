<script lang="ts">
	import { superForm } from 'sveltekit-superforms';

	export let text: string;
	export let textLoading: string;
	export let action: string;

	const form = superForm({});
	const { enhance, delayed, submitting, message } = form;
</script>

<li>
	<form method="post" {action} use:enhance>
		<button type="submit" class="sidebar-item">
			<slot />
			{#if !$delayed}{text}{:else}{textLoading}{/if}
		</button>
	</form>
</li>
