#!/usr/bin/env node
const fs = require('fs-extra');
const exec = require('child-process-promise').exec;
const path = require('path');
const commandExistsWithThrow = require('command-exists');
const yargs = require('yargs');

function commandExists(command) {
  return commandExistsWithThrow(command)
    .then(() => true)
    .catch(() => false);
}

async function validateEnvironment(dest) {
  if (!await commandExists('prettier')) {
    console.warn('Prettier could not be found; Exiting application.');
    process.exit(1);
  }

  if (!await commandExists('meld')) {
    console.warn('Meld could not be found; Exiting application.');
    process.exit(1);
  }

  if (!await fs.pathExists(dest)) {
    console.warn('Destination directory does not exist; Exiting application.');
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

async function main() {
  const argv = yargs
    .usage('Usage: node $0 --src [str] --dest [str] [--config [str]]')
    .alias('s', 'src')
    .describe('s', 'Path to source directory')
    .alias('d', 'dest')
    .describe('d', 'Path to destination directory')
    .alias('c', 'config')
    .describe('c', 'Path to the Prettier config file')
    .alias('e', 'extensions')
    .describe('e', 'Comma separated list of extensions')
    .default('e', 'js,jsx,ts,json,css,scss,less')
    .demand(['s', 'd'])
    .help('h')
    .alias('h', 'help')
    .argv;
  const trailingSlash = /[\\/]+$/;
  const src = path.normalize(argv.src).replace(trailingSlash, '');
  const dest = path.normalize(argv.dest).replace(trailingSlash, '');
  const { config, extensions } = argv;

  await validateEnvironment(dest);
  await fs.emptyDir(dest);
  await fs.copy(src, dest, { filter: getSourceFilter() });
  await exec(await getPrettierCommand(src, dest, config, extensions));
  await exec(`meld "${src}" "${dest}"`);
}

main()
  .catch(err => console.error(err));
