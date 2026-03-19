import { createWriteStream, existsSync } from 'fs';
import { readdir, stat } from 'fs/promises';
import { join, relative } from 'path';
import { createGzip } from 'zlib';
import { pipeline } from 'stream/promises';
import { createReadStream } from 'fs';
import { Writable } from 'stream';

const SRC = 'dist/win-unpacked';
const OUT = 'dist/FinancialAtmosphere-Demo-Win-x64.zip';

if (!existsSync(SRC)) {
  console.error(`Source directory not found: ${SRC}`);
  process.exit(1);
}

// Use the built-in child_process to call the system zip utility
import { execSync } from 'child_process';
import { resolve } from 'path';

const src = resolve(SRC);
const out = resolve(OUT);

console.log(`Zipping ${src} -> ${out}`);
execSync(`cd dist && zip -r "../${OUT}" win-unpacked`, { stdio: 'inherit' });
console.log(`Done! Demo package: ${OUT}`);
