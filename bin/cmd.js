#!/usr/bin/env node
/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import main from '../cli.js';

// This file was invoked directly.
// Note:  Could pass process.exit as callback to force immediate exit.
// eslint-disable-next-line promise/catch-or-return
main(process.argv, process).then((exitCode) => {
  process.exitCode = exitCode;
});
