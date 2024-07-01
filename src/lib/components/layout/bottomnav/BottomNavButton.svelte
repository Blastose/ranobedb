<script lang="ts">
	export let text: string;
	export let href: string;
	export let active = false;
</script>

<a {href} class:active class="bottom-nav-button">
	<slot />
	<span class="text-xs font-bold">{text}</span>
</a>

<style>
	.bottom-nav-button {
		transition-duration: 300ms;
		display: flex;
		flex-direction: column;
		width: 60px;
		align-items: center;
		justify-content: center;
		color: rgb(107 114 128);
	}

	.bottom-nav-button:hover {
		color: rgb(55 65 81);
	}

	.active.bottom-nav-button {
		color: var(--text-light);
	}

	:global(.dark) .bottom-nav-button {
		color: rgb(163 163 163);
	}

	:global(.dark) .bottom-nav-button:hover {
		color: rgb(212 212 212);
	}

	:global(.dark) .active.bottom-nav-button {
		color: var(--text-dark);
	}
</style>
