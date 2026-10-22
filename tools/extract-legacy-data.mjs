// Pulls the data blocks (const AL_RADI_* = {...}) out of the old site's core.js
// and writes each one, unchanged, to data/source/<name>.json.
// Usage: node tools/extract-legacy-data.mjs [path/to/core.js]
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve(import.meta.dirname, '..');
const corePath = process.argv[2] ?? path.join(root, '_original/assets/scripts/core.js');
const outDir = path.join(root, 'data/source');

const src = fs.readFileSync(corePath, 'utf8');
const dataEnd = src.indexOf('const stripDiacritics');
if (dataEnd < 0) throw new Error('Could not find the end of the data section in core.js');

// Run only the data section, turning each `const X =` into a property we can read back.
const ctx = {};
vm.runInNewContext(src.slice(0, dataEnd).replace(/^const (AL_RADI_\w+) =/gm, 'this.$1 ='), ctx);

const toFileName = (name) => name.replace(/^AL_RADI_/, '').toLowerCase().replace(/_/g, '-');

fs.mkdirSync(outDir, { recursive: true });
for (const [name, value] of Object.entries(ctx)) {
  const file = path.join(outDir, toFileName(name) + '.json');
  fs.writeFileSync(file, JSON.stringify(value));
  console.log(`${name} -> ${path.relative(root, file)} (${fs.statSync(file).size} bytes)`);
}
