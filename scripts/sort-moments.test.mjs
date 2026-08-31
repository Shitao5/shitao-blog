import assert from 'node:assert/strict';
import test from 'node:test';

import { sortMomentEntries } from './sort-moments.mjs';

function fixture(entries) {
  return '<!doctype html><html><body><main class="moments-feed">' +
    entries.map(({ id, timestamp, day, dayLabel, text }) =>
      `<article class="moment-entry" id="${id}" data-moment-time="${timestamp}" ` +
        `data-moment-day="${day}" data-moment-day-label="${dayLabel}">${text}</article>`,
    ).join('') +
    '</main></body></html>';
}

test('groups entries by day, sorts newest first, and preserves links', () => {
  const result = sortMomentEntries(fixture([
    { id: '20260829-1906', timestamp: 10, day: '2026-08-29', dayLabel: '2026-08-29 周六', text: '<a href="/moments/#20260829-1906">old</a>' },
    { id: '20260831-1906', timestamp: 30, day: '2026-08-31', dayLabel: '2026-08-31 周一', text: '<a href="/moments/#20260831-1906">new</a>' },
    { id: '20260830-1906', timestamp: 20, day: '2026-08-30', dayLabel: '2026-08-30 周日', text: '<a href="/moments/#20260830-1906">middle</a>' },
  ]));

  assert.equal(result.entries, 3);
  assert.equal(result.changed, true);
  assert.match(
    result.html,
    /data-moment-day="2026-08-31"[\s\S]*data-moment-day="2026-08-30"[\s\S]*data-moment-day="2026-08-29"/,
  );
  assert.equal((result.html.match(/class="moment-day"/g) ?? []).length, 3);
  assert.match(result.html, /href="\/moments\/#20260831-1906">new<\/a>/);
});

test('merges multiple entries from one day and is idempotent', () => {
  const source = fixture([
    { id: 'moment-first', timestamp: 20, day: '2026-08-31', dayLabel: '2026-08-31 周一', text: 'first' },
    { id: 'moment-second', timestamp: 30, day: '2026-08-31', dayLabel: '2026-08-31 周一', text: 'second' },
    { id: 'moment-other-day', timestamp: 10, day: '2026-08-30', dayLabel: '2026-08-30 周日', text: 'other day' },
  ]);
  const firstRun = sortMomentEntries(source);
  const secondRun = sortMomentEntries(firstRun.html);

  assert.equal(firstRun.changed, true);
  assert.equal(secondRun.changed, false);
  assert.equal((firstRun.html.match(/class="moment-day"/g) ?? []).length, 2);
  assert.match(firstRun.html, /moment-second[\s\S]*moment-first/);
  assert.match(firstRun.html, /2026-08-31 周一[\s\S]*2026-08-30 周日/);
});

test('keeps source order for equal timestamps within a day', () => {
  const result = sortMomentEntries(fixture([
    { id: 'moment-first', timestamp: 20, day: '2026-08-31', dayLabel: '2026-08-31 周一', text: 'first' },
    { id: 'moment-second', timestamp: 20, day: '2026-08-31', dayLabel: '2026-08-31 周一', text: 'second' },
  ]));

  assert.match(result.html, /moment-first[\s\S]*moment-second/);
});

test('fails clearly when a moment timestamp is missing or invalid', () => {
  assert.throws(
    () => sortMomentEntries(
      '<main class="moments-feed"><article class="moment-entry">missing</article></main>',
    ),
    /Invalid data-moment-time/,
  );
});

test('fails clearly when day metadata is missing or invalid', () => {
  assert.throws(
    () => sortMomentEntries(fixture([
      { id: 'missing-day', timestamp: 20, day: '', dayLabel: '', text: 'missing day' },
    ])),
    /Invalid data-moment-day/,
  );
});
