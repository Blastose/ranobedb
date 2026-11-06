<script lang="ts">
	import type { Method } from './types';

	interface Props {
		method: Method;
	}

	let { method }: Props = $props();
</script>

<span class="method method-{method.toLowerCase()}">{method}</span>

<style>
	.method {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 3.5rem;
		padding: 0.125rem 0.4rem;
		border-radius: 9999px;
		font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.05em;
		line-height: 1.3;
		color: #ffffff;
	}

	.method-get {
		background-color: var(--finished);
	}

	.method-put {
		background-color: var(--reading);
	}

	.method-delete {
		background-color: var(--dropped);
	}
</style>
