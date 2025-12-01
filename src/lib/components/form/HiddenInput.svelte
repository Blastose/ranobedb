<script lang="ts">
	export let name: string;
	export let value: string | number | boolean;
</script>

<input {name} type="hidden" {value} />
