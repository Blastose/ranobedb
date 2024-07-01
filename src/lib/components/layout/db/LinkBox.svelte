<script lang="ts">
	export let display: string | undefined = undefined;
	export let wrap: boolean = false;
	export let href: string;
</script>

<div class="link-box">
	<a class={wrap ? '' : 'single-line'} {href}
		>{#if display}{display}{:else}<slot />{/if}</a
	>
</div>

<style>
	a {
		display: block;
		padding: 0.5rem 0.75rem;
		max-width: 100%;
	}

	a.single-line {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>
