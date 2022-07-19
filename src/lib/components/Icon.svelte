<script lang="ts">
	type IconType = keyof typeof icons;
	export let _class: string = '';
	export let name: IconType;
	export let width: string;
	export let height: string;

	const icons = {
		close: {
			box: 24,
			svg: `<path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>`
		},
		database: {
			box: 24,
			svg: `<path fill="currentColor" d="M12,3C7.58,3 4,4.79 4,7C4,9.21 7.58,11 12,11C16.42,11 20,9.21 20,7C20,4.79 16.42,3 12,3M4,9V12C4,14.21 7.58,16 12,16C16.42,16 20,14.21 20,12V9C20,11.21 16.42,13 12,13C7.58,13 4,11.21 4,9M4,14V17C4,19.21 7.58,21 12,21C16.42,21 20,19.21 20,17V14C20,16.21 16.42,18 12,18C7.58,18 4,16.21 4,14Z"/>`
		},
		home: {
			box: 24,
			svg: `	<path fill="currentColor" d="M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z" />`
		},
		loading: {
			box: 24,
			svg: `	<path fill="currentColor" d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />`
		},
		menu: {
			box: 24,
			svg: `	<path fill="currentColor" d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z" />`
		},
		profile: {
			box: 24,
			svg: `<path fill="currentColor" d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />`
		}
	};

	const icon = icons[name];
</script>

<svg class={_class} {width} {height} viewBox="0 0 {icon.box} {icon.box}">
	{@html icon.svg}
</svg>
