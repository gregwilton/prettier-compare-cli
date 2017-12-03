const fs = require('fs-extra');
const exec = require('child-process-promise').exec;
const commandExistsWithThrow = require('command-exists');
const yargs = require('yargs');

function commandExists(command) {
  return commandExistsWithThrow(command)
    .then(() => true)
    .catch(() => false);
}

async function validateEnvironment(dest) {
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

async function getPrettierCommand(src, dest, config) {
  const runCommand = (await commandExists('yarn')) ? 'yarn' : 'npm';
  const configArg = config ? `--config "${config}"` : '--no-config';

  return `${runCommand} run prettier ${configArg} --write "${dest}/**/*.*"`;
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
    .demand(['s', 'd'])
    .help('h')
    .alias('h', 'help')
    .argv;

  await validateEnvironment(argv.dest);
  await fs.emptyDir(argv.dest);
  await fs.copy(argv.src, argv.dest, { filter: getSourceFilter() });
  await exec(await getPrettierCommand(argv.src, argv.dest, argv.config));
  await exec(`meld "${argv.src}" "${argv.dest}"`);
}

main()
  .catch(err => console.error(err));
