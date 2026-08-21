import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'dist');
const dest = join(root, '..', 'client', 'public', 'admin');

if (!existsSync(src)) {
  console.error(`Build output not found: ${src}\nRun "npm run build" first.`);
  process.exit(1);
}

rmSync(dest, { recursive: true, force: true });
mkdirSync(dest, { recursive: true });
cpSync(src, dest, { recursive: true });
console.log(`Admin build copied to client/public/admin (served at /admin/ on the client origin).`);
