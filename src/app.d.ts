// See https://kit.svelte.dev/docs/types#app

import type { Theme } from '$lib/stores/themeStore';

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: import('lucia').User | null;
			session: import('lucia').Session | null;
			theme: Theme;
		}
		// interface PageData {}
		// interface Platform {}
		namespace Superforms {
			type Message = {
				type: 'error' | 'success' | 'warning';
				text: string;
			};
		}
	}

	interface Document {
		startViewTransition(updateCallback: () => Promise<void>): ViewTransition;
	}
}

export {};
