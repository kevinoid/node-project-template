/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'node:assert';
import { readFile } from 'node:fs/promises';
import { PassThrough } from 'node:stream';

import main from '../cli.js';
import { modulenameMockSymbol } from '../lib/symbols.js';

const packageJsonPromise = JSON.parse(await readFile(
  new URL('../package.json', import.meta.url),
  { encoding: 'utf8' },
));

const sharedArgs = ['node', 'modulename'];

function neverCalled() {
  assert.fail('Should not be called');
}

function getTestOptions() {
  return {
    [modulenameMockSymbol]: neverCalled,
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
    assert.strictEqual(
      options.stderr.read(),
      "error: unknown option '--unexpected'\n",
    );
    assert.strictEqual(options.stdout.read(), null);
    assert.strictEqual(code, 1);
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
  -q, --quiet    print less output
  -v, --verbose  print more output
  -V, --version  output the version number
  -h, --help     display help for command
`,
      );
      assert.strictEqual(options.stderr.read(), null);
    });
  }

  for (const verOption of ['-V', '--version']) {
    it(`writes version to stdout then exit 0 for ${verOption}`, async () => {
      const packageJson = await packageJsonPromise;
      const options = getTestOptions();
      const code = await main([...sharedArgs, verOption], options);
      assert.strictEqual(options.stderr.read(), null);
      assert.strictEqual(
        options.stdout.read(),
        `${packageJson.version}\n`,
      );
      assert.strictEqual(code, 0);
    });
  }

  it('writes error to stderr and exit 1 on rejection', async () => {
    const options = getTestOptions();
    const err = new Error('test');
    options[modulenameMockSymbol] = () => Promise.reject(err);
    const code = await main(sharedArgs, options);
    assert.strictEqual(options.stderr.read(), `${err}\n`);
    assert.strictEqual(options.stdout.read(), null);
    assert.strictEqual(code, 1);
  });

  it('writes error to stderr and exit 1 on throw', async () => {
    const options = getTestOptions();
    const err = new Error('test');
    options[modulenameMockSymbol] = () => { throw err; };
    const code = await main(sharedArgs, options);
    assert.strictEqual(options.stderr.read(), `${err}\n`);
    assert.strictEqual(options.stdout.read(), null);
    assert.strictEqual(code, 1);
  });

  it('passes non-option arguments as options.files', async () => {
    const args = ['arg1', 'arg2'];
    const options = getTestOptions();
    options[modulenameMockSymbol] = (opts) => {
      assert.deepStrictEqual(opts.files, args);
    };
    const code = await main([...sharedArgs, ...args], options);
    assert.strictEqual(options.stderr.read(), null);
    assert.strictEqual(options.stdout.read(), null);
    assert.strictEqual(code, 0);
  });

  it('verbosity: -1 for --quiet', async () => {
    const options = getTestOptions();
    options[modulenameMockSymbol] = (opts) => {
      assert.strictEqual(opts.verbosity, -1);
    };
    const code = await main([...sharedArgs, '--quiet'], options);
    assert.strictEqual(options.stderr.read(), null);
    assert.strictEqual(options.stdout.read(), null);
    assert.strictEqual(code, 0);
  });

  it('verbosity: 1 for --verbose', async () => {
    const options = getTestOptions();
    options[modulenameMockSymbol] = (opts) => {
      assert.strictEqual(opts.verbosity, 1);
    };
    const code = await main([...sharedArgs, '--verbose'], options);
    assert.strictEqual(options.stderr.read(), null);
    assert.strictEqual(options.stdout.read(), null);
    assert.strictEqual(code, 0);
  });
});
