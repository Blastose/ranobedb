<script lang="ts">
	import { converter } from './markdownToHtml';

	export let markdown: string;
	export let type: 'full' | 'singleline';

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
			}
		};
	}

	$: html = converter(markdown, type);
</script>

<div class="markdown" class:singleline={type === 'singleline'} use:revealSpoilers>
	{@html html}
</div>
