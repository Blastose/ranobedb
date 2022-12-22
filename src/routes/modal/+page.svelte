<script lang="ts">
	import { modal } from '$lib/stores/modalStore';

	const showModal = () => {
		modal.set(true);
	};
</script>

<svelte:head><title>Modal Test</title></svelte:head>

<div class="main-container">
	<button
		on:click={() => {
			showModal();
		}}
		class="duration-300 bg-primary-500 px-2 py-1 rounded-md hover:bg-primary-700"
	>
		Show modal
	</button>

	<p>
		content content content content content content content content content content content content
		content content content content content content content content content content content content
		content content content
	</p>
	<p>content</p>
	<p>content</p>
	<p>content</p>
	<p>content</p>
	<p>content</p>
	<p>content</p>
	<p>content</p>
	<p>content</p>
	<p>content</p>
	<p>content</p>
	<p>content</p>
	<p>content</p>
	<p>content</p>
	<p>content</p>
	<p>content</p>
	<p>content</p>
	<button
		on:click={() => {
			showModal();
		}}
		class="duration-300 bg-primary-500 px-2 py-1 rounded-md hover:bg-primary-700"
	>
		Show modal
	</button>
	<p>content</p>
	<p>content</p>
	<p>content</p>
	<p>content</p>
	<p>content</p>
	<p>content</p>
	<p>content</p>
	<p>content</p>
	<p>content</p>
	<p>content</p>
	<p>content</p>
	<p>content</p>
	<p>content</p>
	<p>content</p>
	<button
		on:click={() => {
			showModal();
		}}
		class="duration-300 bg-primary-500 px-2 py-1 rounded-md hover:bg-primary-700"
	>
		Show modal
	</button>
</div>
