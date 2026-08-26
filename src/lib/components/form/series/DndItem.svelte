<script lang="ts">
	interface Props {
		arrayIndex: number;
		dragging?: boolean;
		currentDragIndex?: number;
		currentHoverIndex?: number;
		currentHover: HTMLElement | undefined;
		children?: import('svelte').Snippet;
	}

	let {
		arrayIndex,
		dragging = $bindable(false),
		currentDragIndex = $bindable(0),
		currentHoverIndex = $bindable(0),
		currentHover = $bindable(),
		children,
	}: Props = $props();

	function drag(node: HTMLElement) {
		function dragStart(e: DragEvent) {
			dragging = true;
			currentDragIndex = arrayIndex;
			currentHoverIndex = arrayIndex;
		}

		function dragEnd() {
			dragging = false;
		}

		function dragOver(e: DragEvent) {
			currentHover = e.currentTarget as HTMLElement;
			currentHoverIndex = arrayIndex;
			if (currentHoverIndex > currentDragIndex) {
				currentHoverIndex++;
			}
		}

		node.addEventListener('dragstart', dragStart);
		node.addEventListener('dragend', dragEnd);
		node.addEventListener('dragover', dragOver);

		return {
			destroy() {
				node.removeEventListener('dragstart', dragStart);
				node.removeEventListener('dragend', dragEnd);
				node.removeEventListener('dragover', dragOver);
			},
		};
	}
</script>

<div use:drag draggable="true" class="flex flex-col">
	{@render children?.()}
</div>
