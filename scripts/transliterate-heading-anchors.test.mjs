import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  pinyinAnchor,
  transformPublicDirectory,
} from './transliterate-heading-anchors.mjs';

async function writeFixture(root, relative, content) {
  const file = path.join(root, relative);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, content, 'utf8');
}

async function listFiles(root) {
  const result = [];
  async function visit(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) await visit(absolute);
      else result.push(path.relative(root, absolute));
    }
  }
  await visit(root);
  return result.sort();
}

test('transliterates representative headings', () => {
  assert.equal(pinyinAnchor('第-31-周-0727-0802'), 'di-31-zhou-0727-0802');
  assert.equal(pinyinAnchor('回家干农活'), 'hui-jia-gan-nong-huo');
  assert.equal(pinyinAnchor('吕布与-JavaScript'), 'lv-bu-yu-javascript');
});

test('rewrites generated fragments without changing page paths or external links', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'shitao-anchor-test-'));
  await writeFixture(
    root,
    'summary/2026/index.html',
    '<!doctype html><html><body>' +
      '<nav><a href="#第-31-周-0727-0802">本周</a></nav>' +
      '<h1 id="第-31-周-0727-0802">第 31 周</h1>' +
      '<a href="https://learn.shitao5.org/post/#第四章">外站</a>' +
      '</body></html>',
  );
  await writeFixture(
    root,
    'posts/example/index.html',
    '<!doctype html><html><body>' +
      '<a href="/summary/2026/#%E7%AC%AC-31-%E5%91%A8-0727-0802">旧站内链接</a>' +
      '</body></html>',
  );

  const beforeFiles = await listFiles(root);
  const result = await transformPublicDirectory(root);
  const afterFiles = await listFiles(root);
  const summary = await readFile(path.join(root, 'summary/2026/index.html'), 'utf8');
  const post = await readFile(path.join(root, 'posts/example/index.html'), 'utf8');

  assert.deepEqual(afterFiles, beforeFiles, 'page paths (and therefore slugs) must not change');
  assert.equal(result.headingsTransliterated, 1);
  assert.match(summary, /<h1 id="di-31-zhou-0727-0802">/);
  assert.match(summary, /id="第-31-周-0727-0802" data-legacy-heading-anchor/);
  assert.match(summary, /href="#di-31-zhou-0727-0802"/);
  assert.match(post, /href="\/summary\/2026\/#di-31-zhou-0727-0802"/);
  assert.match(summary, /href="https:\/\/learn\.shitao5\.org\/post\/#第四章"/);

  const secondRun = await transformPublicDirectory(root);
  assert.equal(secondRun.changedFiles, 0, 'the transform must be idempotent');
});

test('avoids collisions with existing and transliterated ids', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'shitao-anchor-collision-'));
  await writeFixture(
    root,
    'index.html',
    '<!doctype html><html><body>' +
      '<h2 id="shi">ASCII</h2>' +
      '<h2 id="市">市</h2>' +
      '<h2 id="是">是</h2>' +
      '</body></html>',
  );

  await transformPublicDirectory(root);
  const output = await readFile(path.join(root, 'index.html'), 'utf8');
  assert.match(output, /<h2 id="shi">ASCII<\/h2>/);
  assert.match(output, /<h2 id="shi-2">/);
  assert.match(output, /<h2 id="shi-3">/);
});
