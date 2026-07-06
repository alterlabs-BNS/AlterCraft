import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const root = process.cwd();

const runGit = (args) =>
  execFileSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();

const splitLines = (value) => (value ? value.split(/\r?\n/).filter(Boolean) : []);

const normalizeStatusPath = (line) => {
  const raw = line.slice(3).replace(/^"|"$/g, '');
  const renameTarget = raw.includes(' -> ') ? raw.split(' -> ').pop() : raw;
  return renameTarget.replace(/\\/g, '/');
};

const statusLines = splitLines(runGit(['status', '--porcelain=v1']));
const stagedFiles = splitLines(runGit(['diff', '--cached', '--name-only'])).map((file) => file.replace(/\\/g, '/'));

const riskyPatterns = [
  {
    pattern: /^output\/(?:chrome-cdp|chrome-cdp-contractor|qa\/chrome|qa\/chrome-contractordesk-profile)/,
    reason: 'browser profile/cache output must stay outside commits',
  },
  {
    pattern: /(?:^|\/)node_modules\//,
    reason: 'dependency folders must not be committed',
  },
  {
    pattern: /(?:^|\/)\.gradle\//,
    reason: 'Gradle cache output must not be committed',
  },
  {
    pattern: /^tmp\//,
    reason: 'temporary files must not be committed',
  },
  {
    pattern: /(?:^|\/)(?:devserver|preview).*?\.(?:out|err)\.log$/i,
    reason: 'local server logs must not be committed',
  },
  {
    pattern: /^(?:public|build)\/downloads\/.*debug.*\.(?:apk|json)$/i,
    reason: 'debug APK artifacts require explicit release approval',
  },
  {
    pattern: /^(?:Continue Development|Elegant Furniture Business Website|Mobile UI Design for Contractor Desk)(?:\.zip|\/)/i,
    reason: 'design handoff bundles must be archived or intentionally promoted',
  },
];

const riskyMatches = [];
for (const line of statusLines) {
  const file = normalizeStatusPath(line);
  const hit = riskyPatterns.find(({ pattern }) => pattern.test(file));
  if (hit) riskyMatches.push(`${line} (${hit.reason})`);
}

const allowBuildCommit = process.env.ALTERECO_ALLOW_BUILD_COMMIT === '1';
const stagedBuildFiles = stagedFiles.filter((file) => file.startsWith('build/'));

const gitignore = readFileSync('.gitignore', 'utf8');
const buildIgnored = /^build\/$/m.test(gitignore);

const failures = [];
if (riskyMatches.length) {
  failures.push(
    [
      'High-risk generated or handoff files are present in the working tree:',
      ...riskyMatches.slice(0, 20).map((line) => `  - ${line}`),
      riskyMatches.length > 20 ? `  - ...and ${riskyMatches.length - 20} more` : '',
    ]
      .filter(Boolean)
      .join('\n'),
  );
}

if (buildIgnored && stagedBuildFiles.length && !allowBuildCommit) {
  failures.push(
    [
      '`build/` is gitignored but staged for commit.',
      'Regenerate it for deployment, or set ALTERECO_ALLOW_BUILD_COMMIT=1 only for an intentional published-source commit.',
      ...stagedBuildFiles.slice(0, 20).map((file) => `  - ${file}`),
      stagedBuildFiles.length > 20 ? `  - ...and ${stagedBuildFiles.length - 20} more` : '',
    ]
      .filter(Boolean)
      .join('\n'),
  );
}

if (failures.length) {
  console.error('AlterECO pre-commit guard blocked this commit.\n');
  console.error(failures.join('\n\n'));
  console.error('\nRun scripts/altereco-safety-backup.ps1 before cleanup, then stage only the intended release files.');
  process.exit(1);
}

console.log('AlterECO pre-commit guard passed.');
