const del = require('del');
const path = require('path');
const execa = require('execa');
const mkdirp = require('mkdirp');
const { promisify } = require('util');

let mongoToolBuilt = false;
const CONTAINER_DUMP_DIR = '/mongodump';

function runCommand(cmd, args) {
  console.log([cmd, ...args].join(' '));
  return execa(cmd, args, { stdio: 'inherit' });
}

async function ensureMongoTools() {
  if (!mongoToolBuilt) {
    await runCommand('docker', ['build', '-t', 'mongotools', '.']);
    mongoToolBuilt = true;
  }
}

async function dump({ uri, directory, db }) {
  await ensureMongoTools();

  const localDumpDbDir = path.join(directory, db);

  await del(localDumpDbDir);
  await promisify(mkdirp)(localDumpDbDir);

  const args = [
    'run',
    '--rm',
    '-v',
    [directory, CONTAINER_DUMP_DIR].join(':'),
    'mongotools',
    'mongodump',
    '--uri',
    uri,
    '--out',
    CONTAINER_DUMP_DIR
  ];

  return runCommand('docker', args);
};

async function restore({ uri, directory, fromDb, toDb }) {
  await ensureMongoTools();

  const containerRestoreDbDir = path.join(CONTAINER_DUMP_DIR, fromDb);

  const args = [
    'run',
    '--rm',
    '-v',
    [directory, CONTAINER_DUMP_DIR].join(':'),
    'mongotools',
    'mongorestore',
    '--drop',
    '--uri',
    uri,
    '--db',
    toDb,
    '--nsFrom',
    fromDb,
    '--nsTo',
    toDb,
    containerRestoreDbDir
  ];

  return runCommand('docker', args);
};

module.exports = {
  dump,
  restore
};
