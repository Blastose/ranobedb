<script lang="ts">
	export let arrayIndex: number;
	export let dragging = false;
	export let currentDragIndex = 0;
	export let currentHoverIndex = 0;
	export let currentHover: HTMLElement;

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
			}
		};
	}
</script>

<div use:drag draggable="true" class="flex flex-col">
	<slot />
</div>
