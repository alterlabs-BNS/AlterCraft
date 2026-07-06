import { existsSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const downloadsDir = join(process.cwd(), 'build', 'downloads');

if (!existsSync(downloadsDir)) {
  process.exit(0);
}

let removed = 0;
for (const entry of readdirSync(downloadsDir, { withFileTypes: true })) {
  if (entry.isFile() && entry.name.toLowerCase().endsWith('.apk')) {
    rmSync(join(downloadsDir, entry.name), { force: true });
    removed += 1;
  }
}

if (removed > 0) {
  console.log(`Removed ${removed} APK download file(s) from build/downloads before Capacitor sync.`);
}
