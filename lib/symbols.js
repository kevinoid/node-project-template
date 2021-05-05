/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 *
 * Package-private symbols.
 * This file is intentionally excluded from package.json#exports.
 */

/** Symbol of mock function used in place of modulename for testing.
 *
 * @private
 */
// eslint-disable-next-line import/prefer-default-export
export const modulenameMockSymbol = Symbol('modulename');
