<script lang="ts">
	import { melt } from '@melt-ui/svelte';
	import type { DropdownMenu } from '@melt-ui/svelte';

	export let text: string;
	export let href: string;
	export let item: DropdownMenu['elements']['item'];
</script>

<a {href} use:melt={$item}>
	<span class="sidebar-item">
		<slot />
		{text}
	</span>
</a>
