<script lang="ts">
	export let type: 'success' | 'error';
</script>

<div class="alert" class:success={type === 'success'} class:error={type === 'error'}>
	<slot />
</div>

<style>
	.alert {
		padding: 0.5rem 1rem;
		border-radius: 0.375rem;
		border-width: 1px;
	}

	.success {
		border-color: rgb(74 222 128);
		color: rgb(22 101 52);
		background-color: rgb(134 239 172);
	}

	.error {
		border-color: rgb(248 113 113);
		color: rgb(127 29 29);
		background-color: rgb(252 165 165);
	}
</style>
