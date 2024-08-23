<script lang="ts">
	export let name: string;
	export let value: string | number;
</script>

<input {name} type="hidden" {value} />
