#!/usr/bin/env node
const fs = require('fs-extra');
const exec = require('child-process-promise').exec;
const path = require('path');
const commandExistsWithThrow = require('command-exists');
const tmp = require('tmp-promise');
const yargs = require('yargs');

function commandExists(command) {
  return commandExistsWithThrow(command)
    .then(() => true)
    .catch(() => false);
}

async function validateEnvironment(argv) {
  const hasPrettier = await commandExists('prettier');
  const diffTool = argv.difftool.replace(/\s.*$/, '');
  const hasDiffTool = await commandExists(diffTool);

  if (!hasPrettier) {
    console.warn('Prettier could not be found; Exiting application.');
    process.exit(1);
  }

  if (!hasDiffTool) {
    console.warn(`${diffTool} could not be found; Exiting application.`);
    process.exit(1);
  }
}

function getSourceFilter() {
  const exclusions = /(\.git|node_modules)$/i;
  const filter = src => !exclusions.test(src);

  return filter;
}

async function getPrettierCommand(dest, config, extensions) {
  const configArg = config ? `--config "${config}"` : '--no-config';
  const destGlob = `${dest}/**/*.{${extensions}}`;

  return `prettier ${configArg} --write "${destGlob}"`;
}

async function compare(argv, dest) {
  const trailingSlash = /[\\/]+$/;
  const src = path.normalize(argv.src).replace(trailingSlash, '');
  const { config, extensions } = argv;

  await validateEnvironment(argv);
  await fs.copy(src, dest, { filter: getSourceFilter() });
  await exec(await getPrettierCommand(dest, config, extensions));
  await exec(`${argv.difftool} "${src}" "${dest}"`);
  await fs.emptyDir(dest);
}

async function main() {
  const command = yargs
    .usage('Usage: node $0 --src [str] [--config [str]]')
    .alias('s', 'src')
    .describe('s', 'Path to source directory')
    .alias('c', 'config')
    .describe('c', 'Path to the Prettier config file')
    .alias('e', 'extensions')
    .describe('e', 'Comma separated list of extensions')
    .default('e', 'js,jsx,ts,json,css,scss,less')
    .alias('d', 'difftool')
    .describe('d', 'The directory diff command')
    .default('d', 'meld')
    .demand(['s'])
    .help('h')
    .alias('h', 'help');
  const tempDir = await tmp.dir({ unsafeCleanup: true });

  try {
    await compare(command.argv, tempDir.path);
  } catch (err) {
    console.error(err);
  } finally {
    tempDir.cleanup();
  }
}

main();
