<script lang="ts">
	export let display: string;
	export let href: string;
</script>

<div class="link-box">
	<a {href}>{display}</a>
</div>

<style>
	.link-box {
		background-color: var(--bg-light1);
		border-radius: 0.25rem;
		transition: background-color 300ms;
	}

	.link-box:hover {
		background-color: rgb(202, 202, 214);
	}

	a {
		display: block;
		padding: 0.5rem 0.75rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 100%;
	}

	:global(.dark) .link-box {
		background-color: var(--bg-dark1);
	}

	:global(.dark) .link-box:hover {
		background-color: rgb(74, 74, 78);
	}
</style>
