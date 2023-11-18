<script lang="ts">
	import { melt } from '@melt-ui/svelte';
	import type { DropdownMenu } from '@melt-ui/svelte';

	export let text: string;
	export let href: string;
	export let item: DropdownMenu['elements']['item'];
</script>

<a {href} use:melt={$item}>
	<span class="profile-item">
		<slot />
		{text}
	</span>
</a>

<style>
	.profile-item {
		display: flex;
		gap: 0.5rem;
		padding: 0.25rem 0.5rem;
		border-radius: 0.375rem;
		transition-duration: 300ms;
	}

	.profile-item:hover {
		background-color: rgb(202, 202, 214);
	}

	:global(.dark) .profile-item {
		color: var(--text-dark);
	}

	:global(.dark) .profile-item:hover {
		background-color: rgb(74, 74, 78);
	}
</style>
