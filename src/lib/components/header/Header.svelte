<script lang="ts">
	import sidebar from '$lib/stores/sidebar';
</script>

<header>
	<div class="flex gap-2">
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
