import { goto } from '$app/navigation';

export const enhance = (
	form: HTMLFormElement,
	[setErrors, setLoading]: [
		setErrors: (formErrors: Record<string, string>) => void,
		setLoading: (newLoadingState: boolean) => void
	]
) => {
	async function handleSubmit(event: Event, form: HTMLFormElement) {
		event.preventDefault();

		setLoading(true);
		const response = await fetch(form.action, {
			method: form.method,
			headers: { accept: 'application/json' },
			body: new FormData(form)
		});

		setLoading(false);

		if (!response.ok) {
			const responseErrors = await response.json();

			setErrors(responseErrors.errors);
		} else {
			goto('/signup/activate');
		}
	}

	form.addEventListener('submit', (event: Event) => {
		handleSubmit(event, form);
	});

	return {
		destroy() {
			form.removeEventListener('submit', (event: Event) => {
				handleSubmit(event, form);
			});
		}
	};
};
