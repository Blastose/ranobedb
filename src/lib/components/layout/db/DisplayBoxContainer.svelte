<div class="display-box">
	<slot />
</div>

<style>
	.display-box {
		display: grid;
		grid-template-columns: repeat(1, minmax(0, 1fr));
		gap: 1rem;
	}

	@container main (min-width: 728px) {
		.display-box {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@container main (min-width: 1024px) {
		.display-box {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}
	}
</style>
