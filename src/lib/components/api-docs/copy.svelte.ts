export const copyState = $state<{ id: string | null }>({ id: null });

let timer: ReturnType<typeof setTimeout> | undefined;

export async function copyCode(code: string, id: string) {
	try {
		await navigator.clipboard.writeText(code);
		copyState.id = id;
		clearTimeout(timer);
		timer = setTimeout(() => {
			copyState.id = null;
		}, 2000);
	} catch {
		copyState.id = null;
	}
}
