import {JSDocTagInfo, CallExpression, TypeChecker} from '@tsd/typescript';
import {Diagnostic} from '../../interfaces';
import {Handler} from './handler';
import {makeDiagnostic, tsutils} from '../../utils';

interface Options {
	filter(tags: Map<string, JSDocTagInfo>): boolean;
	message(signature: string): string;
}

const expectDeprecatedHelper = (options: Options): Handler => {
	return (checker, nodes) => {
		const diagnostics: Diagnostic[] = [];

		if (!nodes) {
			// Bail out if we don't have any nodes
			return diagnostics;
		}

		for (const node of nodes) {
			const argument = node.arguments[0];

			const tags = tsutils.resolveJSDocTags(checker, argument);

			if (!tags || !options.filter(tags)) {
				// Bail out if not tags couldn't be resolved or when the node matches the filter expression
				continue;
			}

			const message = tsutils.expressionToString(checker, argument);

			diagnostics.push(makeDiagnostic(node, options.message(message ?? '?')));
		}

		return diagnostics;
	};
};

/**
 * Asserts that the argument of the assertion is marked as `@deprecated`.
 * If it's not marked as `@deprecated`, an error diagnostic is returned.
 *
 * @param checker - The TypeScript type checker.
 * @param nodes - The `expectDeprecated` AST nodes.
 * @return List of diagnostics.
 */
export const expectDeprecated = expectDeprecatedHelper({
	filter: tags => !tags.has('deprecated'),
	message: signature => `Expected \`${signature}\` to be marked as \`@deprecated\``
});

/**
 * Asserts that the argument of the assertion is not marked as `@deprecated`.
 * If it's marked as `@deprecated`, an error diagnostic is returned.
 *
 * @param checker - The TypeScript type checker.
 * @param nodes - The `expectNotDeprecated` AST nodes.
 * @return List of diagnostics.
 */
export const expectNotDeprecated = expectDeprecatedHelper({
	filter: tags => tags.has('deprecated'),
	message: signature => `Expected \`${signature}\` to not be marked as \`@deprecated\``
});

/**
 * Asserts that the documentation comment for the argument of the assertion
 * includes the string literal generic type of the assertion.
 *
 * @param checker - The TypeScript type checker.
 * @param nodes - The `expectDocCommentIncludes` AST nodes.
 * @return List of diagnostics.
 */
export const expectDocCommentIncludes = (checker: TypeChecker, nodes: Set<CallExpression>): Diagnostic[] => {
	const diagnostics: Diagnostic[] = [];

	if (!nodes) {
		return diagnostics;
	}

	for (const node of nodes) {
		const expression = tsutils.expressionToString(checker, node.arguments[0]) ?? '?';

		if (!node.typeArguments) {
			diagnostics.push(makeDiagnostic(node, `Expected documentation comment for expression \`${expression}\` not specified.`));
			continue;
		}

		const maybeExpectedDocComment = checker.getTypeFromTypeNode(node.typeArguments[0]);

		if (!maybeExpectedDocComment.isStringLiteral()) {
			diagnostics.push(makeDiagnostic(node, `Expected documentation comment for expression \`${expression}\` should be a string literal.`));
			continue;
		}

		const expectedDocComment = maybeExpectedDocComment.value;
		const docComment = tsutils.resolveDocComment(checker, node.arguments[0]);

		if (!docComment) {
			diagnostics.push(makeDiagnostic(node, `Documentation comment for expression \`${expression}\` not found.`));
			continue;
		}

		if (docComment.includes(expectedDocComment)) {
			// Do nothing
			continue;
		}

		diagnostics.push(makeDiagnostic(node, `Documentation comment \`${docComment}\` for expression \`${expression}\` does not include expected \`${expectedDocComment}\`.`));
	}

	return diagnostics;
};
