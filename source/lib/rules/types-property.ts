import path from 'path';
import fs from 'fs';
import {Context, Diagnostic} from '../interfaces.js';
import {getJSONPropertyPosition} from '../utils/index.js';

/**
 * Rule which enforces the use of a `types` property over a `typings` property.
 *
 * @param context - The context object.
 * @returns A list of custom diagnostics.
 */
export default (context: Context): Diagnostic[] => {
	const {pkg} = context;

	if (!pkg.types && pkg.typings) {
		const packageJsonFullPath = path.join(context.cwd, 'package.json');
		const content = fs.readFileSync(packageJsonFullPath, 'utf8');

		return [
			{
				fileName: packageJsonFullPath,
				message: 'Use property `types` instead of `typings`.',
				severity: 'error',
				...getJSONPropertyPosition(content, 'typings')
			}
		];
	}

	return [];
};
