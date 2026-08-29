import { readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { parse, serialize } from 'parse5';

function walk(node, visit) {
  visit(node);
  for (const child of node.childNodes ?? []) walk(child, visit);
  if (node.content) walk(node.content, visit);
}

function getAttribute(node, name) {
  return node.attrs?.find((attribute) => attribute.name === name);
}

function hasClass(node, className) {
  const classAttribute = getAttribute(node, 'class');
  return classAttribute?.value.split(/\s+/u).includes(className) ?? false;
}

function momentTimestamp(node) {
  const value = getAttribute(node, 'data-moment-time')?.value;
  const timestamp = Number(value);
  if (!Number.isFinite(timestamp)) {
    throw new Error(`Invalid data-moment-time on moment entry: ${value ?? '<missing>'}`);
  }
  return timestamp;
}

function findMomentsFeed(document) {
  let feed;
  walk(document, (node) => {
    if (!feed && hasClass(node, 'moments-feed')) feed = node;
  });
  return feed;
}

function findMomentEntries(feed) {
  const entries = [];
  for (let index = 0; index < (feed.childNodes ?? []).length; index += 1) {
    const node = feed.childNodes[index];
    if (node.tagName !== 'article' || !hasClass(node, 'moment-entry')) continue;
    entries.push({ node, index, timestamp: momentTimestamp(node) });
  }
  return entries;
}

export function sortMomentEntries(html) {
  const document = parse(html);
  const feed = findMomentsFeed(document);
  if (!feed) return { html, entries: 0, changed: false };

  const entries = findMomentEntries(feed);
  const entryPositions = entries.map(({ index }) => index);

  const sorted = [...entries].sort(
    (left, right) => right.timestamp - left.timestamp || left.index - right.index,
  );
  const alreadySorted = sorted.every(({ node }, index) => node === entries[index].node);
  if (alreadySorted) return { html, entries: entries.length, changed: false };

  for (let index = 0; index < entryPositions.length; index += 1) {
    feed.childNodes[entryPositions[index]] = sorted[index].node;
  }

  const output = serialize(document);
  return { html: output, entries: entries.length, changed: output !== html };
}

export async function sortMomentsPage(file) {
  const input = await readFile(file, 'utf8');
  const result = sortMomentEntries(input);
  if (result.changed) await writeFile(file, result.html, 'utf8');
  return result;
}

async function main() {
  const publicDirectory = path.resolve(process.argv[2] ?? 'public');
  const momentsPage = path.join(publicDirectory, 'moments', 'index.html');
  if (!(await stat(momentsPage)).isFile()) {
    throw new Error(`Missing generated moments page: ${momentsPage}`);
  }

  const result = await sortMomentsPage(momentsPage);
  console.log(
    `Moments order: ${result.entries} entries, ` +
      `${result.changed ? 'updated' : 'already sorted'}.`,
  );
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
