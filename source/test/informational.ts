import path from 'path';
import test from 'ava';
import {verify} from './fixtures/utils';
import tsd from '..';

test('print type', async t => {
	const diagnostics = await tsd({cwd: path.join(__dirname, 'fixtures/informational/print-type')});

	verify(t, diagnostics, [
		[4, 0, 'warning', 'Type for expression `aboveZero` is: `(foo: number) => number | null`'],
		[5, 0, 'warning', 'Type for expression `null` is: `null`'],
		[6, 0, 'warning', 'Type for expression `undefined` is: `undefined`'],
		[7, 0, 'warning', 'Type for expression `null as any` is: `any`'],
		[8, 0, 'warning', 'Type for expression `null as never` is: `never`'],
		[9, 0, 'warning', 'Type for expression `null as unknown` is: `unknown`'],
		[10, 0, 'warning', 'Type for expression `\'foo\'` is: `"foo"`'],
		[11, 0, 'warning', 'Type for expression `bigType` is: `{ prop1: SuperTypeWithAnExessiveLongNameThatTakesUpTooMuchSpace; prop2: SuperTypeWithAnExessiveLongNameThatTakesUpTooMuchSpace; prop3: SuperTypeWithAnExessiveLongNameThatTakesUpTooMuchSpace; prop4: SuperTypeWithAnExessiveLongNameThatTakesUpTooMuchSpace; prop5: SuperTypeWithAnExessiveLongNameThatTakesUpTooMuchSpace; prop6: SuperTypeWithAnExessiveLongNameThatTakesUpTooMuchSpace; prop7: SuperTypeWithAnExessiveLongNameThatTakesUpTooMuchSpace; prop8: SuperTypeWithAnExessiveLongNameThatTakesUpTooMuchSpace; prop9: SuperTypeWithAnExessiveLongNameThatTakesUpTooMuchSpace; }`'],
	]);
});
