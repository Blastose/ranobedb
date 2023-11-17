<script lang="ts">
	export let active: boolean;
	export let text: string;
	export let href: string;
</script>

<a {href}>
	<span class:active class="sidebar-item">
		<slot />
		{text}
	</span>
</a>

<style>
	.sidebar-item {
		transition: background-color 300ms;
		border-radius: 0.375rem;
		display: flex;
		gap: 0.5rem;
		padding: 0.25rem 0.5rem;
	}

	.sidebar-item:hover {
		background-color: rgb(202, 202, 214);
	}

	.active.sidebar-item {
		color: var(--text-dark);
		background-color: #73739c;
	}

	:global(.dark) .sidebar-item {
		color: var(--text-dark);
	}

	:global(.dark) .sidebar-item:hover:not(.active) {
		background-color: rgb(74, 74, 78);
	}
</style>
