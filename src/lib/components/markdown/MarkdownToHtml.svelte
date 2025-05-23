<script lang="ts">
	import { converter } from './markdownToHtml';

	interface Props {
		markdown: string;
		type: 'full' | 'singleline';
	}

	let { markdown, type }: Props = $props();

	function addRevealedClass(event: Event) {
		const element = event.currentTarget as HTMLSpanElement;
		element.classList.add('revealed');
	}

	function revealSpoilers(node: HTMLElement) {
		const spoilerTextElements = node.querySelectorAll('.spoiler');
		spoilerTextElements.forEach((element) => {
			element.addEventListener('click', addRevealedClass);
		});
		return {
			destroy() {
				spoilerTextElements.forEach((element) => {
					element.removeEventListener('click', addRevealedClass);
				});
			},
		};
	}

	let html = $derived(converter(markdown, type));
</script>

<div class="markdown" class:singleline={type === 'singleline'} use:revealSpoilers>
	{@html html}
</div>
