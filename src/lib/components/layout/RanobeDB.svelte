<script lang="ts">
	export let hideTextWhenWidthSmall: boolean;
</script>

<h2 class="text-2xl font-bold">
	<a aria-label="Home" class="flex items-center gap-2" href="/">
		<img class="logo" height="28" width="42" src="/rndb_logo.png" alt="" />
		<span class:logo-text={hideTextWhenWidthSmall}>RanobeDB</span>
	</a>
</h2>

<style>
	.logo {
		height: 28px;
		width: 42px;
	}

	.logo-text {
		display: none;
	}

	@media (min-width: 640px) {
		.logo-text {
			display: block;
		}
	}
</style>
