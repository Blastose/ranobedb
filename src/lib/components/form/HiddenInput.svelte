<script lang="ts">
	interface Props {
		name: string;
		value: string | number | boolean;
	}

	let { name, value }: Props = $props();
</script>

<input {name} type="hidden" {value} />
