import path from 'path';
import test from 'ava';
import {verify} from './fixtures/utils';
import tsd from '..';

test('deprecated', async t => {
	const diagnostics = await tsd({cwd: path.join(__dirname, 'fixtures/documentational/expect-deprecated')});

	verify(t, diagnostics, [
		[6, 0, 'error', 'Expected `(foo: number, bar: number): number` to be marked as `@deprecated`'],
		[15, 0, 'error', 'Expected `Options.delimiter` to be marked as `@deprecated`'],
		[19, 0, 'error', 'Expected `Unicorn.RAINBOW` to be marked as `@deprecated`'],
		[34, 0, 'error', 'Expected `RainbowClass` to be marked as `@deprecated`']
	]);
});

test('not deprecated', async t => {
	const diagnostics = await tsd({cwd: path.join(__dirname, 'fixtures/documentational/expect-not-deprecated')});

	verify(t, diagnostics, [
		[5, 0, 'error', 'Expected `(foo: string, bar: string): string` to not be marked as `@deprecated`'],
		[14, 0, 'error', 'Expected `Options.separator` to not be marked as `@deprecated`'],
		[18, 0, 'error', 'Expected `Unicorn.UNICORN` to not be marked as `@deprecated`'],
		[33, 0, 'error', 'Expected `UnicornClass` to not be marked as `@deprecated`']
	]);
});

test('expect doc comment includes', async t => {
	const diagnostics = await tsd({cwd: path.join(__dirname, 'fixtures/documentational/expect-doc-comment')});

	verify(t, diagnostics, [
		[5, 0, 'error', 'Documentation comment for expression `noDocComment` not found.'],
		[10, 0, 'error', 'Expected documentation comment for expression `foo` not specified.'],
		[11, 0, 'error', 'Expected documentation comment for expression `foo` should be a string literal.'],
		[12, 0, 'error', 'Documentation comment `FooBar` for expression `foo` does not include expected `BarFoo`.'],
	]);
});
