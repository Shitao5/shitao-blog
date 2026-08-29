import assert from 'node:assert/strict';
import test from 'node:test';

import { sortMomentEntries } from './sort-moments.mjs';

function fixture(entries) {
  return '<!doctype html><html><body><main class="moments-feed">' +
    entries.map(({ id, timestamp, text }) =>
      `<article class="moment-entry" id="${id}" data-moment-time="${timestamp}">${text}</article>`,
    ).join('') +
    '</main></body></html>';
}

test('sorts moment entries from newest to oldest and preserves links', () => {
  const result = sortMomentEntries(fixture([
    { id: '20260829-1906', timestamp: 10, text: '<a href="/moments/#20260829-1906">old</a>' },
    { id: '20260831-1906', timestamp: 30, text: '<a href="/moments/#20260831-1906">new</a>' },
    { id: '20260830-1906', timestamp: 20, text: '<a href="/moments/#20260830-1906">middle</a>' },
  ]));

  assert.equal(result.entries, 3);
  assert.equal(result.changed, true);
  assert.match(
    result.html,
    /id="20260831-1906"[\s\S]*id="20260830-1906"[\s\S]*id="20260829-1906"/,
  );
  assert.match(result.html, /href="\/moments\/#20260831-1906">new<\/a>/);
});

test('keeps source order for equal timestamps and is idempotent', () => {
  const source = fixture([
    { id: 'moment-first', timestamp: 20, text: 'first' },
    { id: 'moment-second', timestamp: 20, text: 'second' },
  ]);
  const firstRun = sortMomentEntries(source);
  const secondRun = sortMomentEntries(firstRun.html);

  assert.equal(firstRun.changed, false);
  assert.equal(secondRun.changed, false);
  assert.match(firstRun.html, /moment-first[\s\S]*moment-second/);
});

test('fails clearly when a moment timestamp is missing or invalid', () => {
  assert.throws(
    () => sortMomentEntries(
      '<main class="moments-feed"><article class="moment-entry">missing</article></main>',
    ),
    /Invalid data-moment-time/,
  );
});
