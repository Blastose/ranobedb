import { describe, it, expect, beforeAll } from 'vitest';
import { clearDatabase, db, initDatabase, ranobeBot } from './test-setup';
import { DBStaffActions } from '$lib/server/db/staff/actions';
import { DBStaff } from '$lib/server/db/staff/staff';

beforeAll(async () => {
	await clearDatabase(db);
	await initDatabase(db);
});

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
				},
				id: staff.id,
			},
			ranobeBot,
		);
		const changedStaff = await dbStaff.getStaffOneEdit(staff.id).executeTakeFirstOrThrow();
		expect(changedStaff.aliases.length).toBe(3);
		const changedStaffHist = await dbStaff
			.getStaffHistOneEdit({ id: staff.id })
			.executeTakeFirstOrThrow();
		expect(changedStaffHist.aliases.length).toBe(3);

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
							aid: changedStaff.aliases.find((v) => v.name === 'Mary')?.aid!,
						},
						{ main_alias: true, name: 'Bob' },
						{ main_alias: false, name: 'Jane' },
					],
				},
				id: staff.id,
			},
			ranobeBot,
		);
		const changedStaffAfter = await dbStaff.getStaffOneEdit(staff.id).executeTakeFirstOrThrow();
		expect(changedStaffAfter.aliases.length).toBe(3);
		expect(changedStaffAfter.aliases.find((v) => v.name === 'Bob')?.main_alias).toBe(true);
		expect(changedStaffAfter.aliases.find((v) => v.name === 'Mary')?.aid).toBe(
			changedStaff.aliases.find((v) => v.name === 'Mary')?.aid,
		);
		const changedStaffHistAfter = await dbStaff
			.getStaffHistOneEdit({ id: staff.id })
			.executeTakeFirstOrThrow();
		expect(changedStaffHistAfter.aliases.length).toBe(3);
		expect(changedStaffHistAfter.aliases.find((v) => v.name === 'Bob')?.main_alias).toBe(true);
		expect(changedStaffHistAfter.aliases.find((v) => v.name === 'Mary')?.aid).toBe(
			changedStaffHist.aliases.find((v) => v.name === 'Mary')?.aid,
		);
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
		const dbStaff = DBStaff.fromDB(db);
		const addedStaff = await dbStaff.getStaffOneEdit(addedStaffId).executeTakeFirstOrThrow();
		expect(addedStaff.aliases.length).toBe(1);

		const addedStaffHist = await dbStaff
			.getStaffHistOneEdit({ id: addedStaffId })
			.executeTakeFirstOrThrow();
		expect(addedStaffHist.aliases.length).toBe(1);
	});
});
