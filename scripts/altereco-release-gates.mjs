import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();

const checks = [];

const add = (status, area, message, detail = '') => {
  checks.push({ status, area, message, detail });
};

const exists = (path) => existsSync(join(root, path));

const fileSize = (path) => {
  try {
    return statSync(join(root, path)).size;
  } catch {
    return 0;
  }
};

const read = (path) => {
  try {
    return readFileSync(join(root, path), 'utf8');
  } catch {
    return '';
  }
};

const readJson = (path) => {
  try {
    return JSON.parse(readFileSync(join(root, path), 'utf8'));
  } catch {
    return null;
  }
};

const hashFile = (path) => {
  try {
    return createHash('sha256').update(readFileSync(join(root, path))).digest('hex');
  } catch {
    return '';
  }
};

const runGit = (args) => {
  try {
    return execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  } catch (error) {
    return String(error.stdout || error.stderr || error.message || '').trim();
  }
};

const status = runGit(['status', '--short']);
const statusLines = status ? status.split(/\r?\n/).filter(Boolean) : [];

if (!statusLines.length) {
  add('PASS', 'repo', 'Working tree is clean.');
} else {
  const groups = {
    source: 0,
    scripts: 0,
    publicAssets: 0,
    build: 0,
    output: 0,
    handoff: 0,
    other: 0,
  };

  for (const line of statusLines) {
    const file = line.slice(3).replace(/^"|"$/g, '');
    if (file.startsWith('src/')) groups.source += 1;
    else if (file.startsWith('scripts/')) groups.scripts += 1;
    else if (file.startsWith('public/')) groups.publicAssets += 1;
    else if (file.startsWith('build/')) groups.build += 1;
    else if (file.startsWith('output/')) groups.output += 1;
    else if (/Continue Development|Elegant Furniture|Mobile UI Design|\.zip$/i.test(file)) groups.handoff += 1;
    else groups.other += 1;
  }

  add(
    'WARN',
    'repo',
    `Working tree has ${statusLines.length} changed or untracked entries.`,
    Object.entries(groups).map(([key, value]) => `${key}:${value}`).join(', ')
  );
}

const backupRoot = join(root, '..', '_safety_backups');
if (existsSync(backupRoot)) {
  const latestBackup = readdirSync(backupRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith('alter-craft-untracked-'))
    .map((entry) => {
      const fullPath = join(backupRoot, entry.name);
      return { fullPath, modified: statSync(fullPath).mtimeMs };
    })
    .sort((a, b) => b.modified - a.modified)[0];

  if (latestBackup && existsSync(join(latestBackup.fullPath, 'untracked-files.zip'))) {
    const summary = readFileSync(join(latestBackup.fullPath, 'backup-summary.txt'), 'utf8');
    const skipped = summary.match(/untracked_files_skipped=(\d+)/)?.[1] || 'unknown';
    add('PASS', 'repo', 'Latest safety backup exists outside the repo.', `${latestBackup.fullPath}; skipped:${skipped}`);
  } else {
    add('WARN', 'repo', 'Safety backup folder exists but no complete untracked ZIP was found.', backupRoot);
  }
} else {
  add('WARN', 'repo', 'No external safety backup folder found.', 'Run npm.cmd run repo:backup before destructive cleanup.');
}

const gitignore = read('.gitignore');
const trackedBuild = runGit(['ls-files', 'build']);
const trackedBuildCount = trackedBuild ? trackedBuild.split(/\r?\n/).filter(Boolean).length : 0;
if (gitignore.includes('build/') && trackedBuildCount > 0) {
  add('WARN', 'repo', '`build/` is ignored but tracked files still exist.', `${trackedBuildCount} tracked build files`);
} else {
  add('PASS', 'repo', 'Generated build tracking policy is not internally conflicting.');
}

const projectMap = read('docs/CANONICAL_PROJECT_MAP.md');
if (projectMap.includes('_safety_backups') && projectMap.includes('alter craft') && projectMap.includes('Cleanup Law')) {
  add('PASS', 'repo', 'Canonical project map documents live root and cleanup law.');
} else {
  add('WARN', 'repo', 'Canonical project map is missing live-root or cleanup-law details.', 'docs/CANONICAL_PROJECT_MAP.md');
}

const publicContractorApk = 'public/downloads/contractor-desk-debug.apk';
const publicContractorManifest = 'public/downloads/contractor-desk-debug.json';
const buildContractorApk = 'build/downloads/contractor-desk-debug.apk';
const buildContractorManifest = 'build/downloads/contractor-desk-debug.json';

if (exists(publicContractorApk) && fileSize(publicContractorApk) > 1_000_000) {
  add('PASS', 'apk', 'Public ContractorDesk debug APK exists.', `${publicContractorApk} (${fileSize(publicContractorApk)} bytes)`);
} else {
  add('FAIL', 'apk', 'Public ContractorDesk debug APK is missing or too small.', publicContractorApk);
}

const publicManifest = readJson(publicContractorManifest);
if (publicManifest && publicManifest.sha256 && publicManifest.size) {
  const actualHash = hashFile(publicContractorApk);
  const actualSize = fileSize(publicContractorApk);
  if (actualHash === publicManifest.sha256 && actualSize === publicManifest.size) {
    add('PASS', 'apk', 'Public ContractorDesk APK manifest matches file hash and size.', publicContractorManifest);
  } else {
    add('FAIL', 'apk', 'Public ContractorDesk APK manifest does not match the APK.', publicContractorManifest);
  }
} else {
  add('WARN', 'apk', 'Public ContractorDesk APK manifest is missing or incomplete.', publicContractorManifest);
}

if (exists(buildContractorApk) && fileSize(buildContractorApk) > 1_000_000) {
  add('PASS', 'apk', 'Build ContractorDesk debug APK exists.', `${buildContractorApk} (${fileSize(buildContractorApk)} bytes)`);
} else {
  add('WARN', 'apk', 'Build ContractorDesk APK is missing; rebuild may be needed.', buildContractorApk);
}

const buildManifest = readJson(buildContractorManifest);
if (buildManifest && buildManifest.sha256 && buildManifest.size && exists(buildContractorApk)) {
  const actualHash = hashFile(buildContractorApk);
  const actualSize = fileSize(buildContractorApk);
  if (actualHash === buildManifest.sha256 && actualSize === buildManifest.size) {
    add('PASS', 'apk', 'Build ContractorDesk APK manifest matches file hash and size.', buildContractorManifest);
  } else {
    add('FAIL', 'apk', 'Build ContractorDesk APK manifest does not match the APK.', buildContractorManifest);
  }
} else {
  add('WARN', 'apk', 'Build ContractorDesk APK manifest is missing or incomplete.', buildContractorManifest);
}

if (exists('public/downloads/operator-desk-debug.apk') || exists('build/downloads/operator-desk-debug.apk')) {
  add('WARN', 'apk', 'Stale OperatorDesk APK filename still exists.', 'Current artifact should be ContractorDesk.');
} else {
  add('PASS', 'apk', 'No stale OperatorDesk APK filename found.');
}

const bedDir = join(root, 'public/images/beds');
if (existsSync(bedDir)) {
  const bedImages = readdirSync(bedDir).filter((name) => /^bed-\d{2}\.jpg$/i.test(name)).sort();
  const missing = [];
  for (let i = 1; i <= 40; i += 1) {
    const expected = `bed-${String(i).padStart(2, '0')}.jpg`;
    if (!bedImages.includes(expected)) missing.push(expected);
  }

  if (!missing.length && exists('public/images/beds/beds-hero.jpg')) {
    add('PASS', 'beds', 'Beds image set is complete.', '40 bed images plus hero image');
  } else {
    add('FAIL', 'beds', 'Beds image set is incomplete.', missing.join(', ') || 'missing beds-hero.jpg');
  }
} else {
  add('FAIL', 'beds', 'Beds image directory is missing.', 'public/images/beds');
}

const bedsData = read('src/data/beds.ts');
if (bedsData.includes('INR 15,000') && bedsData.includes('INR 17,500') && bedsData.includes('INR 21,000')) {
  add('PASS', 'beds', 'Beds starting-price ladder is present.');
} else {
  add('WARN', 'beds', 'Beds starting-price ladder was not found in data copy.');
}

const routes = [
  ['home', 'build/index.html'],
  ['beds', 'build/beds/index.html'],
  ['contractor desk', 'build/ContractorDesk/index.html'],
  ['operator dashboard', 'build/operator-desk/dashboard/index.html'],
  ['contact', 'build/contact/index.html'],
  ['blog', 'build/blog/index.html'],
];

for (const [label, path] of routes) {
  if (exists(path)) add('PASS', 'routes', `${label} generated route exists.`, path);
  else add('FAIL', 'routes', `${label} generated route is missing.`, path);
}

const sitemap = read('build/sitemap.xml');
if (sitemap.includes('https://www.altercraft.in/beds') && sitemap.includes('https://www.altercraft.in/ContractorDesk')) {
  add('PASS', 'seo', 'Build sitemap includes Beds and ContractorDesk.');
} else {
  add('FAIL', 'seo', 'Build sitemap is missing Beds or ContractorDesk.');
}

const robots = read('build/robots.txt');
for (const directive of ['Disallow: /admin/', 'Disallow: /my-projects/', 'Disallow: /ai-planner/submitted', 'Disallow: /downloads/']) {
  if (robots.includes(directive)) add('PASS', 'seo', `robots.txt includes ${directive}`);
  else add('FAIL', 'seo', `robots.txt is missing ${directive}`);
}

const serverDb = read('server/operatorDeskDb.json');
if (serverDb) {
  try {
    const parsed = JSON.parse(serverDb);
    const jobs = Array.isArray(parsed.jobs) ? parsed.jobs : [];
    const incompleteJobs = jobs.filter((job) =>
      !('totalValue' in job) ||
      !('advanceReceived' in job) ||
      !('pendingAmount' in job) ||
      !('paymentGateStatus' in job)
    );

    if (!jobs.length) {
      add('WARN', 'backend', 'OperatorDesk local server DB has no jobs.', 'server/operatorDeskDb.json');
    } else if (incompleteJobs.length) {
      add('WARN', 'backend', 'OperatorDesk local server DB job shape is behind frontend model.', `${incompleteJobs.length}/${jobs.length} jobs missing typed fields`);
    } else {
      add('PASS', 'backend', 'OperatorDesk local server DB job shape matches current frontend fields.');
    }
  } catch {
    add('FAIL', 'backend', 'OperatorDesk local server DB is not valid JSON.', 'server/operatorDeskDb.json');
  }
} else {
  add('WARN', 'backend', 'OperatorDesk local server DB not found.', 'server/operatorDeskDb.json');
}

const operatorReadme = read('src/operatorDesk/README.md');
if (operatorReadme.includes('Supabase backend') && operatorReadme.includes('localStorage')) {
  add('PASS', 'backend', 'OperatorDesk docs disclose MVP storage and future backend direction.');
} else {
  add('WARN', 'backend', 'OperatorDesk docs should disclose storage and backend limitation.');
}

const ledgerSchema = read('docs/ledger/altercraft-ledger-schema.sql');
if (
  ledgerSchema.includes('finance.ledger_entries') &&
  ledgerSchema.includes('prevent_ledger_mutation') &&
  ledgerSchema.includes('assert_transaction_balanced')
) {
  add('PASS', 'ledger', 'Append-only double-entry ledger schema is present.');
} else {
  add('FAIL', 'ledger', 'Append-only double-entry ledger schema is missing required invariants.', 'docs/ledger/altercraft-ledger-schema.sql');
}

const failCount = checks.filter((check) => check.status === 'FAIL').length;
const warnCount = checks.filter((check) => check.status === 'WARN').length;
const passCount = checks.filter((check) => check.status === 'PASS').length;

const order = { FAIL: 0, WARN: 1, PASS: 2 };
checks.sort((a, b) => order[a.status] - order[b.status] || a.area.localeCompare(b.area));

console.log('AlterECO release gates');
console.log(`PASS ${passCount} | WARN ${warnCount} | FAIL ${failCount}`);
console.log('');

for (const check of checks) {
  const suffix = check.detail ? ` - ${check.detail}` : '';
  console.log(`[${check.status}] ${check.area}: ${check.message}${suffix}`);
}

if (failCount > 0) {
  process.exitCode = 1;
}
