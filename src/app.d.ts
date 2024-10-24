// See https://kit.svelte.dev/docs/types#app

import type { Theme } from '$lib/stores/themeStore';
import type { ToastData } from '$lib/components/toast/toast';
import type { Perm } from '$lib/db/permissions';
import type { Session, User } from '$lib/server/lucia/lucia';

interface RenderParameters {
	sitekey: string;
	action?: string | undefined;
	cData?: string | undefined;
	callback?: (token: string) => void;
	'expired-callback'?: (token: string) => void;
	'error-callback'?: VoidFunction | undefined;
	'timeout-callback'?: VoidFunction | undefined;
	'before-interactive-callback'?: VoidFunction | undefined;
	'after-interactive-callback'?: VoidFunction | undefined;
	'unsupported-callback'?: VoidFunction | undefined;
	theme?: Theme | undefined;
	tabindex?: number | undefined;
	size?: WidgetSize | undefined;
	retry?: FailureRetryMode | undefined;
	'retry-interval'?: number | undefined;
	language?: string | undefined;
	appearance?: AppearanceMode | undefined;
	'response-field'?: boolean | undefined;
	'response-field-name'?: string | undefined;
	'refresh-expired'?: RefreshExpiredMode | undefined;
	'refresh-timeout'?: RefreshTimeoutMode | undefined;
}

// for information about these interfaces
declare global {
	namespace App {
		interface Error {
			message?: string | null;
			dbItemDeleted?: {
				title: string | null;
				reason: string | null;
			};
			missingPerm?: Perm;
		}
		interface Locals {
			user: User | null;
			session: Session | null;
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

	interface Window {
		turnstile: {
			ready(callback: () => void): void;
			render(container: string | HTMLElement, params?: RenderParameters): string | null | undefined;
			execute(container: string | HTMLElement, params?: RenderParameters): void;
			reset(container?: string | HTMLElement): void;
			remove(container?: string | HTMLElement): void;
			getResponse(container?: string | HTMLElement): string | undefined;
			isExpired(container?: string | HTMLElement): boolean;
		};
	}
}

export {};
