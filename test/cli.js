/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

'use strict';

const assert = require('assert');
const { PassThrough } = require('stream');

const main = require('../cli.js');
const packageJson = require('../package.json');

const sharedArgs = ['node', 'modulename'];

function getTestOptions() {
  return {
    stdin: new PassThrough(),
    stdout: new PassThrough({ encoding: 'utf8' }),
    stderr: new PassThrough({ encoding: 'utf8' }),
  };
}

describe('modulename/cli.js', () => {
  it('rejects TypeError with no args', () => {
    return assert.rejects(
      () => main(),
      TypeError,
    );
  });

  it('rejects TypeError for non-Array Array-like first arg', () => {
    return assert.rejects(
      () => main({ 0: '', 1: '', length: 2 }, getTestOptions()),
      TypeError,
    );
  });

  it('rejects TypeError for non-Array iterable first arg', () => {
    // eslint-disable-next-line no-empty-function
    const iter = (function* () {}());
    return assert.rejects(
      () => main(iter, getTestOptions()),
      TypeError,
    );
  });

  it('rejects TypeError for Array with less than 2 items', () => {
    return assert.rejects(
      () => main(['node'], getTestOptions()),
      TypeError,
    );
  });

  it('rejects TypeError for non-Object second arg', () => {
    return assert.rejects(
      () => main(sharedArgs, 1),
      TypeError,
    );
  });

  it('rejects TypeError for missing stdin', () => {
    const options = getTestOptions();
    delete options.stdin;
    return assert.rejects(
      () => main(sharedArgs, options),
      TypeError,
    );
  });

  it('rejects TypeError for missing stdout', () => {
    const options = getTestOptions();
    delete options.stdout;
    return assert.rejects(
      () => main(sharedArgs, options),
      TypeError,
    );
  });

  it('rejects TypeError for missing stderr', () => {
    const options = getTestOptions();
    delete options.stderr;
    return assert.rejects(
      () => main(sharedArgs, options),
      TypeError,
    );
  });

  it('writes error and exit 1 for unexpected option', async () => {
    const options = getTestOptions();
    const code = await main([...sharedArgs, '--unexpected'], options);
    assert.strictEqual(code, 1);
    assert.strictEqual(options.stdout.read(), null);
    assert.strictEqual(
      options.stderr.read(),
      "error: unknown option '--unexpected'\n",
    );
  });

  for (const helpOption of ['-h', '--help']) {
    it(`writes usage to stdout with exit 0 for ${helpOption}`, async () => {
      const options = getTestOptions();
      const code = await main([...sharedArgs, helpOption], options);
      assert.strictEqual(code, 0);
      assert.strictEqual(
        options.stdout.read(),
        `Usage: modulename [options] [file...]

Command description.

Options:
  -q, --quiet    Print less output
  -v, --verbose  Print more output
  -V, --version  output the version number
  -h, --help     display help for command
`,
      );
      assert.strictEqual(options.stderr.read(), null);
    });
  }

  for (const verOption of ['-V', '--version']) {
    it(`writes version to stdout then exit 0 for ${verOption}`, async () => {
      const options = getTestOptions();
      const code = await main([...sharedArgs, verOption], options);
      assert.strictEqual(code, 0);
      assert.strictEqual(
        options.stdout.read(),
        `${packageJson.version}\n`,
      );
      assert.strictEqual(options.stderr.read(), null);
    });
  }
});
