// See https://kit.svelte.dev/docs/types#app

import type { Theme } from '$lib/stores/themeStore';
import type { ToastData } from '$lib/components/toast/toast';

// for information about these interfaces
declare global {
	namespace App {
		interface Error {
			message?: string | null;
			dbItemDeleted?: {
				title: string | null;
				reason: string | null;
			};
		}
		interface Locals {
			user: import('lucia').User | null;
			session: import('lucia').Session | null;
			theme: Theme;
		}
		interface PageData {
			flash?: { type: ToastData['type']; message: string };
		}
		// interface Platform {}
		namespace Superforms {
			type Message = {
				type: ToastData['type'];
				text: string;
			};
		}
	}

	interface Document {
		startViewTransition(updateCallback: () => Promise<void>): ViewTransition;
	}
}

export {};
