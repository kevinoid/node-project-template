#!/usr/bin/env node
/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

'use strict';

const main = require('../cli.js');

// This file was invoked directly.
// Note:  Could pass process.exit as callback to force immediate exit.
main(process.argv, process, (exitCode) => {
  process.exitCode = exitCode;
});
