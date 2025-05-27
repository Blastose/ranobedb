<script lang="ts">
	import { superForm } from 'sveltekit-superforms';

	interface Props {
		text: string;
		textLoading: string;
		action: string;
		children?: import('svelte').Snippet;
	}

	let { text, textLoading, action, children }: Props = $props();

	const form = superForm({});
	const { enhance, delayed, submitting, message } = form;
</script>

<li>
	<form method="post" {action} use:enhance>
		<button type="submit" class="sidebar-item">
			{@render children?.()}
			{#if !$delayed}{text}{:else}{textLoading}{/if}
		</button>
	</form>
</li>
