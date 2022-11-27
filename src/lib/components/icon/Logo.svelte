<script lang="ts" context="module">
	export type IconType = keyof typeof icons;
	const icons = {
		logo: {
			svg: `<g><rect x="104" y="71.93" width="185.62" height="43.75" fill="#696987" stroke="none" transform="rotate(90,196.81,93.81)" /><rect x="156" y="71.93" width="185.62" height="43.75" fill="#cdcedd" stroke="none" transform="rotate(90,248.81,93.81)" /><rect x="38" y="73.25" width="185.62" height="43.75" fill="#bbbcce" stroke="none" transform="rotate(80,130.81,95.13)" /><rect x="-34.62" y="81.12" width="185.62" height="43.75" fill="#73739c" stroke="none" transform="rotate(65,58.19,103)" /></g>`
		}
	};
</script>

<script lang="ts">
	export let name: IconType;
	export let width: string;
	export let height: string;
	export let hidden: boolean = true;

	const icon = icons[name];
</script>

<svg aria-hidden={hidden} class={$$props.class} {width} {height} viewBox="-0.5 -0.5 272 197">
	{@html icon.svg}
</svg>
