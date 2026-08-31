(() => {
  const feed = document.querySelector('.moments-feed');
  if (!feed) return;

  const directEntries = (parent) => Array.from(parent.children)
    .filter((element) => element.classList.contains('moment-entry'))
    .map((element, index) => ({
      element,
      index,
      timestamp: Number(element.dataset.momentTime),
      day: element.dataset.momentDay,
      dayLabel: element.dataset.momentDayLabel,
    }));

  const compareEntries = (left, right) =>
    right.timestamp - left.timestamp || left.index - right.index;

  const validEntries = (entries) => entries.every(({ timestamp, day, dayLabel }) =>
    Number.isFinite(timestamp) && /^\d{4}-\d{2}-\d{2}$/u.test(day ?? '') && Boolean(dayLabel));

  const replaceDirectEntries = (parent, entries, replacements, originalChildren) => {
    const entryElements = new Set(entries.map(({ element }) => element));
    const firstEntryIndex = originalChildren.indexOf(entries[0].element);
    const children = [];

    originalChildren.forEach((node, index) => {
      if (index === firstEntryIndex) children.push(...replacements);
      if (!entryElements.has(node)) children.push(node);
    });
    parent.replaceChildren(...children);
  };

  const createDayGroup = (entries) => {
    const firstEntry = entries[0];
    const headingId = `moment-day-${firstEntry.day.replaceAll('-', '')}`;
    const group = document.createElement('section');
    group.className = 'moment-day';
    group.dataset.momentDay = firstEntry.day;
    group.dataset.momentTime = String(firstEntry.timestamp);
    group.setAttribute('aria-labelledby', headingId);

    const heading = document.createElement('h2');
    heading.className = 'moment-day__title';
    heading.id = headingId;

    const date = document.createElement('time');
    date.dateTime = firstEntry.day;
    date.textContent = firstEntry.dayLabel;
    heading.append(date);
    group.append(heading, ...entries.map(({ element }) => element));
    return group;
  };

  const entries = directEntries(feed);
  if (entries.length > 0) {
    if (!validEntries(entries)) {
      console.error('Unable to group moments: invalid moment metadata.');
      return;
    }

    const originalChildren = Array.from(feed.childNodes);
    const sortedEntries = [...entries].sort(compareEntries);
    const groupedEntries = [];
    sortedEntries.forEach((entry) => {
      const currentGroup = groupedEntries.at(-1);
      if (currentGroup?.day === entry.day) {
        currentGroup.entries.push(entry);
      } else {
        groupedEntries.push({ day: entry.day, entries: [entry] });
      }
    });

    replaceDirectEntries(
      feed,
      entries,
      groupedEntries.map(({ entries: groupEntries }) => createDayGroup(groupEntries)),
      originalChildren,
    );
  } else {
    const groups = Array.from(feed.children)
      .filter((element) => element.classList.contains('moment-day'))
      .map((element, index) => ({
        element,
        index,
        entries: directEntries(element),
      }));

    if (!groups.length) return;
    if (groups.some(({ entries: groupEntries }) => !validEntries(groupEntries))) {
      console.error('Unable to sort moments: invalid moment metadata.');
      return;
    }

    const sortedGroups = groups
      .map((group) => ({
        ...group,
        sortedEntries: [...group.entries].sort(compareEntries),
      }))
      .sort((left, right) =>
        right.sortedEntries[0].timestamp - left.sortedEntries[0].timestamp || left.index - right.index);

    sortedGroups.forEach(({ element, entries: groupEntries, sortedEntries }) => {
      const entryElements = new Set(groupEntries.map(({ element: entry }) => entry));
      const sortedEntryElements = sortedEntries.map(({ element: entry }) => entry);
      const originalChildren = Array.from(element.childNodes);
      const replacementChildren = [];
      let entryIndex = 0;

      originalChildren.forEach((node) => {
        if (entryElements.has(node)) {
          replacementChildren.push(sortedEntryElements[entryIndex]);
          entryIndex += 1;
        } else {
          replacementChildren.push(node);
        }
      });
      element.replaceChildren(...replacementChildren);
      element.dataset.momentTime = String(sortedEntries[0].timestamp);
    });

    const groupElements = new Set(groups.map(({ element }) => element));
    const sortedGroupElements = sortedGroups.map(({ element }) => element);
    const originalChildren = Array.from(feed.childNodes);
    const replacementChildren = [];
    let groupIndex = 0;

    originalChildren.forEach((node) => {
      if (groupElements.has(node)) {
        replacementChildren.push(sortedGroupElements[groupIndex]);
        groupIndex += 1;
      } else {
        replacementChildren.push(node);
      }
    });
    feed.replaceChildren(...replacementChildren);
  }

  if (window.location.hash.length > 1) {
    let targetId;
    try {
      targetId = decodeURIComponent(window.location.hash.slice(1));
    } catch {
      return;
    }

    const target = document.getElementById(targetId);
    if (target) requestAnimationFrame(() => target.scrollIntoView());
  }
})();
