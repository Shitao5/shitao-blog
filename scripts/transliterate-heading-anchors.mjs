import { createHash } from 'node:crypto';
import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { parse } from 'parse5';
import { pinyin } from 'pinyin-pro';

const CJK_RE = /\p{Script=Han}/u;
const HEADING_RE = /^h[1-6]$/;
const DEFAULT_INTERNAL_HOSTS = new Set([
  'shitao5.org',
  'www.shitao5.org',
  'shitao.netlify.app',
]);

function walk(node, visit) {
  visit(node);
  for (const child of node.childNodes ?? []) walk(child, visit);
  if (node.content) walk(node.content, visit);
}

function getAttribute(node, name) {
  return node.attrs?.find((attribute) => attribute.name === name);
}

function escapeAttribute(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;');
}

export function pinyinAnchor(value) {
  const transliterated = pinyin(value, {
    toneType: 'none',
    type: 'array',
    nonZh: 'consecutive',
    v: true,
  }).join('-');

  const slug = transliterated
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (slug) return slug;
  return `section-${createHash('sha1').update(value).digest('hex').slice(0, 10)}`;
}

async function listHtmlFiles(directory) {
  const files = [];

  async function visit(current) {
    const entries = await readdir(current, { withFileTypes: true });
    entries.sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) await visit(absolute);
      else if (entry.isFile() && entry.name.endsWith('.html')) files.push(absolute);
    }
  }

  await visit(directory);
  return files;
}

function canonicalUrlPath(publicDirectory, file) {
  let relative = path.relative(publicDirectory, file).split(path.sep).join('/');
  if (relative === 'index.html') return '/';
  if (relative.endsWith('/index.html')) {
    relative = relative.slice(0, -'index.html'.length);
  }
  return `/${relative}`;
}

function canonicalizePathname(pathname) {
  if (pathname === '/index.html') return '/';
  if (pathname.endsWith('/index.html')) {
    return pathname.slice(0, -'index.html'.length);
  }
  if (!pathname.endsWith('/') && path.posix.extname(pathname) === '') {
    return `${pathname}/`;
  }
  return pathname;
}

function addEnvironmentHost(hosts, value) {
  if (!value) return;
  try {
    hosts.add(new URL(value).host);
  } catch {
    // Ignore malformed optional environment variables.
  }
}

function internalHosts() {
  const hosts = new Set(DEFAULT_INTERNAL_HOSTS);
  addEnvironmentHost(hosts, process.env.URL);
  addEnvironmentHost(hosts, process.env.DEPLOY_PRIME_URL);
  addEnvironmentHost(hosts, process.env.DEPLOY_URL);
  return hosts;
}

function uniqueAnchor(base, reserved) {
  let candidate = base;
  let suffix = 2;
  while (reserved.has(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  reserved.add(candidate);
  return candidate;
}

function analyzeHtml(html, file, publicDirectory) {
  const document = parse(html, { sourceCodeLocationInfo: true });
  const headings = [];
  const links = [];
  const reserved = new Set();

  walk(document, (node) => {
    const id = getAttribute(node, 'id');
    if (id) reserved.add(id.value);

    if (HEADING_RE.test(node.tagName ?? '') && id && CJK_RE.test(id.value)) {
      headings.push({ node, oldId: id.value });
    }

    const href = getAttribute(node, 'href');
    if (href && href.value.includes('#')) links.push({ node, href: href.value });
  });

  const seenOldIds = new Set();
  const mappings = headings.map(({ node, oldId }) => {
    if (seenOldIds.has(oldId)) {
      throw new Error(`Duplicate heading id "${oldId}" in ${file}`);
    }
    seenOldIds.add(oldId);
    return {
      node,
      oldId,
      newId: uniqueAnchor(pinyinAnchor(oldId), reserved),
    };
  });

  return {
    file,
    html,
    urlPath: canonicalUrlPath(publicDirectory, file),
    mappings,
    links,
  };
}

function mappingForHref(href, currentPath, mappingsByPath, hosts) {
  const hashPosition = href.indexOf('#');
  if (hashPosition < 0 || hashPosition === href.length - 1) return undefined;

  const isAbsolute = /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(href) || href.startsWith('//');
  let parsed;
  try {
    parsed = new URL(href, `https://shitao-anchor.invalid${currentPath}`);
  } catch {
    return undefined;
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) return undefined;
  if (isAbsolute && parsed.host !== 'shitao-anchor.invalid' && !hosts.has(parsed.host)) {
    return undefined;
  }

  let oldId;
  try {
    oldId = decodeURIComponent(parsed.hash.slice(1));
  } catch {
    return undefined;
  }

  const targetPath = canonicalizePathname(parsed.pathname);
  const newId = mappingsByPath.get(targetPath)?.get(oldId);
  if (!newId) return undefined;

  return `${href.slice(0, hashPosition + 1)}${newId}`;
}

function attributeEdit(node, name, value) {
  const location = node.sourceCodeLocation?.attrs?.[name];
  if (!location) throw new Error(`Missing source location for ${name} attribute`);
  return {
    start: location.startOffset,
    end: location.endOffset,
    text: `${name}="${escapeAttribute(value)}"`,
  };
}

function applyEdits(html, edits) {
  edits.sort((a, b) => b.start - a.start || b.end - a.end);
  let output = html;
  let previousStart = html.length + 1;

  for (const edit of edits) {
    if (edit.end > previousStart) throw new Error('Overlapping HTML edits detected');
    output = `${output.slice(0, edit.start)}${edit.text}${output.slice(edit.end)}`;
    previousStart = edit.start;
  }
  return output;
}

export async function transformPublicDirectory(directory) {
  const publicDirectory = path.resolve(directory);
  if (!(await stat(publicDirectory)).isDirectory()) {
    throw new Error(`Not a directory: ${publicDirectory}`);
  }

  const files = await listHtmlFiles(publicDirectory);
  const documents = [];
  for (const file of files) {
    documents.push(analyzeHtml(await readFile(file, 'utf8'), file, publicDirectory));
  }

  const mappingsByPath = new Map();
  for (const document of documents) {
    const pageMappings = new Map();
    for (const mapping of document.mappings) {
      pageMappings.set(mapping.oldId, mapping.newId);
    }
    mappingsByPath.set(canonicalizePathname(document.urlPath), pageMappings);
  }

  const hosts = internalHosts();
  const result = {
    htmlFiles: files.length,
    changedFiles: 0,
    headingsTransliterated: 0,
    fragmentLinksRewritten: 0,
  };

  for (const document of documents) {
    const edits = [];

    for (const mapping of document.mappings) {
      edits.push(attributeEdit(mapping.node, 'id', mapping.newId));
      const insertionPoint = mapping.node.sourceCodeLocation?.startTag?.endOffset;
      if (insertionPoint === undefined) {
        throw new Error(`Missing heading source location in ${document.file}`);
      }
      edits.push({
        start: insertionPoint,
        end: insertionPoint,
        text: `<span id="${escapeAttribute(mapping.oldId)}" data-legacy-heading-anchor aria-hidden="true"></span>`,
      });
      result.headingsTransliterated += 1;
    }

    for (const link of document.links) {
      const rewritten = mappingForHref(
        link.href,
        document.urlPath,
        mappingsByPath,
        hosts,
      );
      if (!rewritten || rewritten === link.href) continue;
      edits.push(attributeEdit(link.node, 'href', rewritten));
      result.fragmentLinksRewritten += 1;
    }

    if (edits.length === 0) continue;
    await writeFile(document.file, applyEdits(document.html, edits), 'utf8');
    result.changedFiles += 1;
  }

  return result;
}

async function main() {
  const directory = process.argv[2] ?? 'public';
  const result = await transformPublicDirectory(directory);
  console.log(
    `Pinyin anchors: ${result.headingsTransliterated} headings, ` +
      `${result.fragmentLinksRewritten} links, ${result.changedFiles}/${result.htmlFiles} HTML files changed.`,
  );
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
