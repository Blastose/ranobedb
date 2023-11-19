<script lang="ts">
	import { melt } from '@melt-ui/svelte';
	import type { DropdownMenu } from '@melt-ui/svelte';
	import { enhance } from '$app/forms';

	export let text: string;
	export let item: DropdownMenu['elements']['item'];
	export let action: string;
</script>

<form method="post" {action} use:enhance>
	<button type="submit" class="sidebar-item" use:melt={$item}>
		<slot />
		{text}
	</button>
</form>
