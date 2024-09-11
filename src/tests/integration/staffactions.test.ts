import { describe, it, expect, beforeAll } from 'vitest';
import { clearDatabase, db, initDatabase, ranobeBot } from './test-setup';
import { DBStaffActions } from '$lib/server/db/staff/actions';
import { DBStaff, type StaffEdit } from '$lib/server/db/staff/staff';
import type { MaybePromise } from '@sveltejs/kit';
import { setupStaffEditObjsForEqualityTest } from '$lib/db/obj';

beforeAll(async () => {
	await clearDatabase(db);
	await initDatabase(db);
});

async function testStaff(params: { id: number; cb_staff: (stf: StaffEdit) => MaybePromise<void> }) {
	const { id, cb_staff: cb_publisher } = params;
	const dbStaff = DBStaff.fromDB(db);

	const staff = await dbStaff.getStaffOneEdit(id).executeTakeFirstOrThrow();

	const staffHist = await dbStaff.getStaffHistOneEdit({ id: id }).executeTakeFirstOrThrow();

	await cb_publisher(staff);
	await cb_publisher(staffHist);

	setupStaffEditObjsForEqualityTest(staff, staffHist);
	expect(staff).toStrictEqual(staffHist);
}

describe('staff actions', () => {
	it('should edit the staff', async () => {
		const dbStaffActions = DBStaffActions.fromDB(db);
		const dbStaff = DBStaff.fromDB(db);
		const staff = await db.selectFrom('staff').select('id').executeTakeFirstOrThrow();
		const staffFull = await dbStaff.getStaffOneEdit(staff.id).executeTakeFirstOrThrow();
		await dbStaffActions.editStaff(
			{
				staff: {
					comment: 'Test',
					hidden: false,
					locked: false,
					aliases: [
						{ main_alias: false, name: 'Mary' },
						{ main_alias: false, name: 'Steve' },
						...staffFull.aliases,
					],
					pixiv_id: 1,
					twitter_id: '1',
					website: 'https://asdf.com',
				},
				id: staff.id,
			},
			ranobeBot,
		);
		const changedStaff = await dbStaff.getStaffOneEdit(staff.id).executeTakeFirstOrThrow();

		await testStaff({
			id: staff.id,
			cb_staff: (s) => {
				expect(s.aliases.length).toBe(3);
			},
		});

		await dbStaffActions.editStaff(
			{
				staff: {
					comment: 'Test',
					hidden: false,
					locked: false,
					aliases: [
						{
							main_alias: false,
							name: 'Mary',
							aid: changedStaff.aliases.find((v) => v.name === 'Mary')?.aid,
						},
						{ main_alias: true, name: 'Bob' },
						{ main_alias: false, name: 'Jane' },
					],
					pixiv_id: undefined,
					twitter_id: undefined,
					website: undefined,
				},
				id: staff.id,
			},
			ranobeBot,
		);

		await testStaff({
			id: staff.id,
			cb_staff: (s) => {
				expect(s.aliases.length).toBe(3);
				expect(s.aliases.find((v) => v.name === 'Bob')?.main_alias).toBe(true);
				expect(s.aliases.find((v) => v.name === 'Mary')?.aid).toBe(
					changedStaff.aliases.find((v) => v.name === 'Mary')?.aid,
				);
			},
		});

		await testStaff({
			id: staff.id,
			cb_staff: (s) => {
				expect(s.aliases.length).toBe(3);
				expect(s.aliases.find((v) => v.name === 'Bob')?.main_alias).toBe(true);
				expect(s.aliases.find((v) => v.name === 'Mary')?.aid).toBe(
					changedStaff.aliases.find((v) => v.name === 'Mary')?.aid,
				);
			},
		});
	});

	it('should add a staff', async () => {
		const dbStaffActions = DBStaffActions.fromDB(db);
		const addedStaffId = await dbStaffActions.addStaff(
			{
				staff: {
					comment: 'Test',
					hidden: false,
					locked: false,
					aliases: [{ main_alias: true, name: 'Jimmy' }],
				},
			},
			ranobeBot,
		);

		await testStaff({
			id: addedStaffId,
			cb_staff: (s) => {
				expect(s.aliases.length).toBe(1);
			},
		});
	});
});
