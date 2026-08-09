import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) {
    error(401, { message: 'unauthorized' });
  }
  return json(locals.user);
};
