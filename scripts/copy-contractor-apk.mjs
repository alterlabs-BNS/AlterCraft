import { copyFileSync, existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';

const root = process.cwd();
const source = join(root, 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
const targets = [
  join(root, 'public', 'downloads', 'contractor-desk-debug.apk'),
  join(root, 'build', 'downloads', 'contractor-desk-debug.apk'),
];

if (!existsSync(source)) {
  throw new Error(`Missing debug APK at ${source}`);
}

for (const target of targets) {
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(source, target);
}

const hash = createHash('sha256').update(await import('node:fs').then((fs) => fs.readFileSync(source))).digest('hex');
const size = statSync(source).size;
const manifest = {
  name: 'AlterCraft Contractor Desk debug APK',
  source,
  targets,
  size,
  sha256: hash,
  generatedAt: new Date().toISOString(),
};

writeFileSync(
  join(root, 'public', 'downloads', 'contractor-desk-debug.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
);
writeFileSync(
  join(root, 'build', 'downloads', 'contractor-desk-debug.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
);

console.log(`Copied Contractor Desk APK (${size} bytes, sha256 ${hash})`);
