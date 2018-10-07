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

async function validateEnvironment() {
  if (!(await commandExists('prettier'))) {
    console.warn('Prettier could not be found; Exiting application.');
    process.exit(1);
  }

  if (!(await commandExists('meld'))) {
    console.warn('Meld could not be found; Exiting application.');
    process.exit(1);
  }
}

function getSourceFilter() {
  const exclusions = /(\.git|node_modules)$/i;
  const filter = src => !exclusions.test(src);

  return filter;
}

async function getPrettierCommand(src, dest, config, extensions) {
  const configArg = config ? `--config "${config}"` : '--no-config';
  const destGlob = `${dest}/**/*.{${extensions}}`;

  return `prettier ${configArg} --write "${destGlob}"`;
}

async function compare(argv, dest) {
  const trailingSlash = /[\\/]+$/;
  const src = path.normalize(argv.src).replace(trailingSlash, '');
  const { config, extensions } = argv;

  await validateEnvironment();
  await fs.copy(src, dest, { filter: getSourceFilter() });
  await exec(await getPrettierCommand(src, dest, config, extensions));
  await exec(`meld "${src}" "${dest}"`);
  await fs.emptyDir(dest);
}

async function main() {
  const command = yargs
    .usage('Usage: node $0 --src [str] --dest [str] [--config [str]]')
    .alias('s', 'src')
    .describe('s', 'Path to source directory')
    .alias('c', 'config')
    .describe('c', 'Path to the Prettier config file')
    .alias('e', 'extensions')
    .describe('e', 'Comma separated list of extensions')
    .default('e', 'js,jsx,ts,json,css,scss,less')
    .demand(['s'])
    .help('h')
    .alias('h', 'help');

  return tmp
    .withDir(dir => compare(command.argv, dir.path))
    .catch(err => console.error(err));
}

main();
