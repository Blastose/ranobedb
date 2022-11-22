<script lang="ts">
	import sidebar from '$lib/stores/sidebar';
</script>

<header>
	<div class="flex gap-2 max-w-7xl px-8 py-2 mx-auto duration-150">
		<button
			class="rounded-md bg-sky-300"
			on:click={() => {
				sidebar.set(!$sidebar);
			}}
			>click
		</button>
		<p>RanobeDB</p>
	</div>
</header>
