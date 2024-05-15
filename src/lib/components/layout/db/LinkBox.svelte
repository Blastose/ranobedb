<script lang="ts">
	export let display: string;
	export let href: string;
</script>

<div class="link-box">
	<a {href}>{display}</a>
</div>

<style>
	a {
		display: block;
		padding: 0.5rem 0.75rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 100%;
	}
</style>
