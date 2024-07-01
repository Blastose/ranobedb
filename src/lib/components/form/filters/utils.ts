import type { LogicalOp } from '$lib/db/dbConsts';

export function getAllOrAny(logicalOp: LogicalOp): 'all' | 'any' {
	if (logicalOp === 'and') {
		return 'all';
	} else {
		return 'any';
	}
}
