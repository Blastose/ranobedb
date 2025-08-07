import type { Theme } from '$lib/stores/themeStore';
import type { Handle } from '@sveltejs/kit';
import { getMode } from '$lib/mode/mode';
import schedule from 'node-schedule';
import { sendRecentlyReleasedNotifications } from '$lib/server/db/cron/release';
import { updateBookReleaseDate, updateBookReleaseDates } from '$lib/server/db/cron/book';
import { updateSeriesPopularity, updateSeriesStartEndDates } from '$lib/server/db/cron/series';
import { Lucia } from '$lib/server/lucia/lucia';
import { db } from '$lib/server/db/db';

schedule.scheduleJob('0 0 * * *', async function () {
	await sendRecentlyReleasedNotifications();
	await updateBookReleaseDate();
	await updateBookReleaseDates();
	await updateSeriesStartEndDates();
	await updateSeriesPopularity();
});

export const handle: Handle = async ({ event, resolve }) => {
	const sessionCookieName = 'auth_session';
	const sessionId = event.cookies.get(sessionCookieName);
	const lucia = new Lucia(db);
	if (!sessionId) {
		event.locals.user = null;
		event.locals.session = null;
	} else {
		const { session, user } = await lucia.validateSessionToken(sessionId);
		if (session !== null) {
			lucia.setSessionTokenCookie(event, sessionId, session.expiresAt);
		} else {
			lucia.deleteSessionTokenCookie(event);
		}
		event.locals.user = user;
		event.locals.session = session;
	}

	const themeCookie = event.cookies.get('theme');
	let theme: Theme = 'dark';
	if (themeCookie === 'light' || themeCookie === 'dark') {
		theme = themeCookie;
	}
	event.locals.theme = theme;

	const response = await resolve(event, {
		transformPageChunk: ({ html }) => {
			return html.replace('<html lang="en">', `<html lang="en" class="${theme}">`);
		},
	});

	// Limit link header since it can be too large for Nginx
	// See https://github.com/sveltejs/kit/issues/11084
	if (getMode() === 'production') {
		const linkHeader = response.headers.get('link');
		let newLinkHeader = '';
		if (linkHeader) {
			const splits = linkHeader.split(',');
			for (const split of splits) {
				if (newLinkHeader.length + split.length < 3500) {
					newLinkHeader += split;
				}
			}
		}
		if (newLinkHeader) {
			response.headers.set('link', newLinkHeader);
		} else {
			response.headers.delete('link');
		}
	}

	return response;
};
