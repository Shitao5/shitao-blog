(() => {
  const feed = document.querySelector('.moments-feed');
  if (!feed) return;

  const entries = Array.from(feed.children)
    .filter((element) => element.classList.contains('moment-entry'))
    .map((element, index) => ({
      element,
      index,
      timestamp: Number(element.dataset.momentTime),
    }));

  if (entries.some(({ timestamp }) => !Number.isFinite(timestamp))) {
    console.error('Unable to sort moments: invalid data-moment-time.');
    return;
  }

  entries
    .sort((left, right) => right.timestamp - left.timestamp || left.index - right.index)
    .forEach(({ element }) => feed.append(element));

  if (window.location.hash.length > 1) {
    const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
    if (target) requestAnimationFrame(() => target.scrollIntoView());
  }
})();
