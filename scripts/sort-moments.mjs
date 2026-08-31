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

function classNames(...names) {
  return names.join(' ');
}

function createAttribute(name, value) {
  return { name, value };
}

function createTextNode(value) {
  return { nodeName: '#text', value };
}

function createElement(tagName, attrs = [], childNodes = []) {
  return {
    nodeName: tagName,
    tagName,
    attrs,
    namespaceURI: 'http://www.w3.org/1999/xhtml',
    childNodes,
  };
}

function momentTimestamp(node) {
  const value = getAttribute(node, 'data-moment-time')?.value;
  const timestamp = Number(value);
  if (!Number.isFinite(timestamp)) {
    throw new Error(`Invalid data-moment-time on moment entry: ${value ?? '<missing>'}`);
  }
  return timestamp;
}

function momentDay(node) {
  const value = getAttribute(node, 'data-moment-day')?.value;
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(value ?? '')) {
    throw new Error(`Invalid data-moment-day on moment entry: ${value ?? '<missing>'}`);
  }
  return value;
}

function momentDayLabel(node) {
  const value = getAttribute(node, 'data-moment-day-label')?.value;
  if (!value) {
    throw new Error('Missing data-moment-day-label on moment entry');
  }
  return value;
}

function findMomentsFeed(document) {
  let feed;
  walk(document, (node) => {
    if (!feed && hasClass(node, 'moments-feed')) feed = node;
  });
  return feed;
}

function findDirectMomentEntries(parent) {
  const entries = [];
  for (let index = 0; index < (parent.childNodes ?? []).length; index += 1) {
    const node = parent.childNodes[index];
    if (node.tagName !== 'article' || !hasClass(node, 'moment-entry')) continue;
    entries.push({
      node,
      index,
      timestamp: momentTimestamp(node),
      day: momentDay(node),
      dayLabel: momentDayLabel(node),
    });
  }
  return entries;
}

function findMomentGroups(feed) {
  const groups = [];
  for (let index = 0; index < (feed.childNodes ?? []).length; index += 1) {
    const node = feed.childNodes[index];
    if (node.tagName !== 'section' || !hasClass(node, 'moment-day')) continue;

    const entries = findDirectMomentEntries(node);
    if (entries.length === 0) {
      throw new Error('Moment day group contains no moment entries');
    }

    const day = getAttribute(node, 'data-moment-day')?.value;
    if (!/^\d{4}-\d{2}-\d{2}$/u.test(day ?? '')) {
      throw new Error(`Invalid data-moment-day on moment group: ${day ?? '<missing>'}`);
    }

    groups.push({ node, index, day, entries });
  }
  return groups;
}

function compareEntries(left, right) {
  return right.timestamp - left.timestamp || left.index - right.index;
}

function replaceDirectEntries(parent, entries, replacement) {
  const entryNodes = new Set(entries.map(({ node }) => node));
  const firstEntryIndex = entries[0]?.index;
  if (firstEntryIndex === undefined) return;

  const childNodes = [];
  for (let index = 0; index < (parent.childNodes ?? []).length; index += 1) {
    const node = parent.childNodes[index];
    if (index === firstEntryIndex) childNodes.push(...replacement);
    if (!entryNodes.has(node)) childNodes.push(node);
  }
  parent.childNodes = childNodes;
}

function reorderNodesAtOriginalPositions(parent, items, sortedItems) {
  const positions = items.map(({ index }) => index);
  for (let index = 0; index < positions.length; index += 1) {
    parent.childNodes[positions[index]] = sortedItems[index].node;
  }
}

function createMomentDayGroup(entries) {
  const firstEntry = entries[0];
  const headingId = `moment-day-${firstEntry.day.replaceAll('-', '')}`;
  const heading = createElement(
    'h2',
    [createAttribute('id', headingId), createAttribute('class', 'moment-day__title')],
    [createElement(
      'time',
      [createAttribute('datetime', firstEntry.day)],
      [createTextNode(firstEntry.dayLabel)],
    )],
  );

  return createElement(
    'section',
    [
      createAttribute('class', classNames('moment-day')),
      createAttribute('data-moment-day', firstEntry.day),
      createAttribute('data-moment-time', String(firstEntry.timestamp)),
      createAttribute('aria-labelledby', headingId),
    ],
    [heading, createTextNode('\n'), ...entries.flatMap(({ node }, index) => [
      ...(index > 0 ? [createTextNode('\n')] : []),
      node,
    ])],
  );
}

export function sortMomentEntries(html) {
  const document = parse(html);
  const feed = findMomentsFeed(document);
  if (!feed) return { html, entries: 0, changed: false };

  const directEntries = findDirectMomentEntries(feed);
  if (directEntries.length > 0) {
    const sortedEntries = [...directEntries].sort(compareEntries);
    const groupedEntries = [];
    for (const entry of sortedEntries) {
      const currentGroup = groupedEntries.at(-1);
      if (currentGroup?.day === entry.day) {
        currentGroup.entries.push(entry);
      } else {
        groupedEntries.push({ day: entry.day, entries: [entry] });
      }
    }

    const groups = groupedEntries.map(({ entries }) => createMomentDayGroup(entries));
    replaceDirectEntries(feed, directEntries, groups);
  } else {
    const groups = findMomentGroups(feed);
    if (groups.length === 0) return { html, entries: 0, changed: false };

    const sortedGroups = groups.map((group) => ({
      ...group,
      sortedEntries: [...group.entries].sort(compareEntries),
    })).sort((left, right) => right.sortedEntries[0].timestamp - left.sortedEntries[0].timestamp || left.index - right.index);

    for (const group of sortedGroups) {
      reorderNodesAtOriginalPositions(group.node, group.entries, group.sortedEntries);
      const day = group.sortedEntries[0].day;
      const dayAttribute = getAttribute(group.node, 'data-moment-day');
      if (dayAttribute) dayAttribute.value = day;
      const timeAttribute = getAttribute(group.node, 'data-moment-time');
      if (timeAttribute) timeAttribute.value = String(group.sortedEntries[0].timestamp);
    }

    reorderNodesAtOriginalPositions(feed, groups, sortedGroups);
  }

  const output = serialize(document);
  const entries = directEntries.length > 0
    ? directEntries
    : findMomentGroups(feed).flatMap(({ entries: groupEntries }) => groupEntries);
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
