/**
 * @copyright Copyright 2017-2020 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 * @module modulename/cli.js
 */

'use strict';

const { Command } = require('commander');
const packageJson = require('./package.json');
const modulename = require('.');

/** Option parser to count the number of occurrences of the option.
 *
 * @private
 * @param {boolean|string} optarg Argument passed to option (ignored).
 * @param {number=} previous Previous value of option (counter).
 * @returns {number} previous + 1.
 */
function countOption(optarg, previous) {
  return (previous || 0) + 1;
}

/** Options for command entry points.
 *
 * @typedef {{
 *   env: !object<string,string>,
 *   stdin: !module:stream.Readable,
 *   stdout: !module:stream.Writable,
 *   stderr: !module:stream.Writable
 * }} CommandOptions
 * @property {!object<string,string>} env Environment variables.
 * @property {!module:stream.Readable} stdin Stream from which input is read.
 * @property {!module:stream.Writable} stdout Stream to which output is
 * written.
 * @property {!module:stream.Writable} stderr Stream to which errors and
 * non-output status messages are written.
 */
// const CommandOptions;

/** Entry point for this command.
 *
 * @param {Array<string>} args Command-line arguments.
 * @param {!CommandOptions} options Options.
 * @param {function(number)} callback Callback with exit code.
 */
function modulenameMain(args, options, callback) {
  if (typeof callback !== 'function') {
    throw new TypeError('callback must be a function');
  }

  if (args !== undefined
      && args !== null
      && Math.floor(args.length) !== args.length) {
    throw new TypeError('args must be Array-like');
  }

  if (!options || typeof options !== 'object') {
    throw new TypeError('options must be an object');
  }

  if (!options.stdin || typeof options.stdin.on !== 'function') {
    throw new TypeError('options.stdin must be a stream.Readable');
  }
  if (!options.stdout || typeof options.stdout.write !== 'function') {
    throw new TypeError('options.stdout must be a stream.Writable');
  }
  if (!options.stderr || typeof options.stderr.write !== 'function') {
    throw new TypeError('options.stderr must be a stream.Writable');
  }

  if (args.length >= 2) {
    // Strip "node" and script name, ensure args are strings
    args = Array.prototype.slice.call(args, 2).map(String);
  } else {
    args = [];
  }

  const command = new Command()
    .exitOverride()
    .configureOutput({
      writeOut: (str) => options.stdout.write(str),
      writeErr: (str) => options.stderr.write(str),
      getOutHelpWidth: () => options.stdout.columns,
      getErrHelpWidth: () => options.stderr.columns,
    })
    .arguments('[file...]')
    .allowExcessArguments(false)
    // Check for required/excess arguments.
    // Workaround https://github.com/tj/commander.js/issues/1493
    .action(() => {})
    .description('Command description.')
    .option('-q, --quiet', 'Print less output', countOption)
    .option('-v, --verbose', 'Print more output', countOption)
    .version(packageJson.version);

  try {
    command.parse(args);
  } catch (errParse) {
    const exitCode =
      errParse.exitCode !== undefined ? errParse.exitCode : 1;
    process.nextTick(callback, exitCode);
    return;
  }

  const argOpts = command.opts();
  const cmdOpts = {
    files: command.args,
    verbosity: (argOpts.verbose || 0) - (argOpts.quiet || 0),
  };
  // eslint-disable-next-line promise/catch-or-return
  modulename(cmdOpts)
    .then(
      () => 0,
      (err) => {
        options.stderr.write(`${err}\n`);
        return 1;
      },
    )
    // Note: nextTick for unhandledException (like util.callbackify)
    .then((exitCode) => process.nextTick(callback, exitCode));
}

module.exports = modulenameMain;