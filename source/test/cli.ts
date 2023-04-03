import path from 'node:path';
import test from 'ava';
import {execa} from 'execa';
import {readPackageUp} from 'read-pkg-up';
import tsd, {formatter} from '../index.js';

type ExecaError = {
	readonly exitCode: number;
	readonly stderr: string;
} & Error;

test('fail if errors are found', async t => {
	const {exitCode, stderr} = await t.throwsAsync<ExecaError>(execa('../../../cli.js', {
		cwd: path.resolve('fixtures/failure'),
	}));

	t.is(exitCode, 1);
	t.regex(stderr, /5:19 {2}Argument of type number is not assignable to parameter of type string./);
});

test('succeed if no errors are found', async t => {
	const {exitCode} = await execa('../../../cli.js', {
		cwd: path.resolve('fixtures/success'),
	});

	t.is(exitCode, 0);
});

test('provide a path', async t => {
	const file = path.resolve('fixtures/failure');

	const {exitCode, stderr} = await t.throwsAsync<ExecaError>(execa('dist/cli.js', [file]));

	t.is(exitCode, 1);
	t.regex(stderr, /5:19 {2}Argument of type number is not assignable to parameter of type string./);
});

test('cli help flag', async t => {
	const {exitCode} = await execa('dist/cli.js', ['--help']);

	t.is(exitCode, 0);
});

test('cli version flag', async t => {
	const pkg = await readPackageUp({normalize: false})?.packageJson ?? {};

	const {exitCode, stdout} = await execa('dist/cli.js', ['--version']);

	t.is(exitCode, 0);
	t.is(stdout, pkg.version);
});

test('cli typings flag', async t => {
	const runTest = async (arg: '--typings' | '-t') => {
		const {exitCode, stderr} = await t.throwsAsync<ExecaError>(execa('../../../cli.js', [arg, 'utils/index.d.ts'], {
			cwd: path.resolve('fixtures/typings-custom-dir'),
		}));

		t.is(exitCode, 1);
		t.true(stderr.includes('✖  5:19  Argument of type number is not assignable to parameter of type string.'));
	};

	await runTest('--typings');
	await runTest('-t');
});

test('cli files flag', async t => {
	const runTest = async (arg: '--files' | '-f') => {
		const {exitCode, stderr} = await t.throwsAsync<ExecaError>(execa('../../../cli.js', [arg, 'unknown.test.ts'], {
			cwd: path.resolve('fixtures/specify-test-files'),
		}));

		t.is(exitCode, 1);
		t.true(stderr.includes('✖  5:19  Argument of type number is not assignable to parameter of type string.'));
	};

	await runTest('--files');
	await runTest('-f');
});

test('cli files flag array', async t => {
	const {exitCode, stderr} = await t.throwsAsync<ExecaError>(execa('../../../cli.js', ['--files', 'unknown.test.ts', '--files', 'second.test.ts'], {
		cwd: path.resolve('fixtures/specify-test-files'),
	}));

	t.is(exitCode, 1);
	t.true(stderr.includes('✖  5:19  Argument of type number is not assignable to parameter of type string.'));
});

test('cli typings and files flags', async t => {
	const typingsFile = 'dist/test/fixtures/typings-custom-dir/utils/index.d.ts';
	const testFile = 'dist/test/fixtures/typings-custom-dir/index.test-d.ts';

	const {exitCode, stderr} = t.throws<ExecaError>(() => execa.commandSync(`dist/cli.js -t ${typingsFile} -f ${testFile}`));

	t.is(exitCode, 1);
	t.true(stderr.includes('✖  5:19  Argument of type number is not assignable to parameter of type string.'));
});

test('tsd logs stacktrace on failure', async t => {
	const {exitCode, stderr, stack} = await t.throwsAsync<ExecaError>(execa('../../../cli.js', {
		cwd: path.resolve('fixtures/empty-package-json'),
	}));

	t.is(exitCode, 1);
	t.true(stderr.includes('Error running tsd: JSONError: Unexpected end of JSON input while parsing empty string'));
	t.truthy(stack);
});

test('exported formatter matches cli results', async t => {
	const options = {
		cwd: path.resolve('fixtures/failure'),
	};

	const {stderr: cliResults} = await t.throwsAsync<ExecaError>(execa('../../../cli.js', options));

	t.true(cliResults.includes('✖  5:19  Argument of type number is not assignable to parameter of type string.'));

	const tsdResults = await tsd(options);
	const formattedResults = formatter(tsdResults);

	t.true(formattedResults.includes('✖  5:19  Argument of type number is not assignable to parameter of type string.'));
});
