import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectDir = path.resolve(__dirname, '..');
const distDir = path.join(projectDir, 'dist');
const htmlPath = path.join(distDir, 'index.html');

const html = fs.readFileSync(htmlPath, 'utf8');
const cssMatch = html.match(/<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/);
const jsMatch = html.match(/<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>/);

if (!cssMatch || !jsMatch) {
  throw new Error('Could not find CSS or JS tag in dist/index.html');
}

const cssRel = cssMatch[1].replace(/^\.?\//, '');
const jsRel = jsMatch[1].replace(/^\.?\//, '');

const css = fs.readFileSync(path.join(distDir, cssRel), 'utf8');
const js = fs.readFileSync(path.join(distDir, jsRel), 'utf8');

if (/<\/script/i.test(js)) {
  throw new Error('Bundled JS contains "</script", which would break inline module script.');
}

let out = html.replace(cssMatch[0], () => `<style>\n${css}\n</style>`);
out = out.replace(jsMatch[0], () => `<script type="module">\n${js}\n</script>`);

const standalonePath = path.join(projectDir, 'standalone.html');
const docsDir = path.join(projectDir, 'docs');
const docsHtmlPath = path.join(docsDir, 'index.html');
const nojekyllPath = path.join(docsDir, '.nojekyll');

fs.writeFileSync(standalonePath, out, 'utf8');
fs.mkdirSync(docsDir, { recursive: true });
fs.writeFileSync(docsHtmlPath, out, 'utf8');
fs.writeFileSync(nojekyllPath, '', 'utf8');

const byteSize = Buffer.byteLength(out, 'utf8');
console.log(`Generated standalone.html, docs/index.html (${byteSize} bytes), and docs/.nojekyll`);
