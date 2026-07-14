#!/usr/bin/env node

import { execFile } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';

const projectName = 'blog';
const environmentFile = join(import.meta.dirname, '.env');
const execFileAsync = promisify(execFile);

async function runGcloudSubcommand(gcloudArguments) {
  console.log(`> gcloud ${gcloudArguments.join(' ')}`);
  try {
    const { stdout } = await execFileAsync('gcloud', gcloudArguments);
    return stdout.trim();
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error('gcloud is required but was not found in PATH');
    }
    throw error;
  }
}

async function findProjectId() {
  const projectIdOutput = await runGcloudSubcommand([
    'projects',
    'list',
    `--filter=name=${projectName}`,
    '--format=value(projectId)'
  ]);
  const projectIds = projectIdOutput.split(/\r?\n/).filter(Boolean);
  if (projectIds.length !== 1) {
    throw new Error(`Expected exactly one accessible project named "${projectName}", found ${projectIds.length}`);
  }
  return projectIds[0];
}

async function findServerUsername() {
  const accountEmail = await runGcloudSubcommand(['config', 'get-value', 'account']);
  const emailSeparatorIndex = accountEmail.indexOf('@');
  if (emailSeparatorIndex <= 0) {
    throw new Error(`The active gcloud account is not a valid email address: ${accountEmail}`);
  }
  return accountEmail.slice(0, emailSeparatorIndex);
}

async function readEnvironmentFile() {
  try {
    return await readFile(environmentFile, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') {
      return '';
    }
    throw error;
  }
}

function setEnvironmentVariables(environmentContents, environmentVariables) {
  const variableNames = Object.keys(environmentVariables);
  const retainedLines = environmentContents
    .split(/\r?\n/)
    .filter((line) => !variableNames.some((variableName) => line.startsWith(`${variableName}=`)));

  while (retainedLines.at(-1) === '') {
    retainedLines.pop();
  }

  const variableLines = Object.entries(environmentVariables)
    .map(([variableName, value]) => `${variableName}=${value}`);
  return [...retainedLines, ...variableLines, ''].join('\n');
}

async function run() {
  const projectId = await findProjectId();
  const serverUsername = await findServerUsername();

  await runGcloudSubcommand(['config', 'set', 'project', projectId]);
  await runGcloudSubcommand(['auth', 'application-default', 'set-quota-project', projectId]);

  const environmentContents = await readEnvironmentFile();
  const googleCloudEnvironmentVariables = {
    GOOGLE_CLOUD_PROJECT_ID: projectId,
    GOOGLE_CLOUD_SERVER_USERNAME: serverUsername
  };
  const environmentVariableNames = new Intl.ListFormat('en', { type: 'conjunction' })
    .format(Object.keys(googleCloudEnvironmentVariables));
  console.log(`Adding env vars ${environmentVariableNames} to .env`);
  const updatedEnvironmentContents = setEnvironmentVariables(
    environmentContents,
    googleCloudEnvironmentVariables
  );
  await writeFile(environmentFile, updatedEnvironmentContents, { mode: 0o600 });
}

console.log('Running...')
await run();
console.log('Done!')
