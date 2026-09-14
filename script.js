(() => {
  // Email campaign images: replace/add entries here to update the wall.
  const images = [
    { name: 'LS', width: 700, height: 1539, src: '00_LS.webp' },
    { name: 'AYOH', width: 700, height: 1763, src: '01_AYOH.webp' },
    { name: 'EUROCAR', width: 700, height: 1647, src: '02_EUROCAR.webp' },
    { name: 'OT', width: 700, height: 1273, src: '03_OT.webp' },
    { name: 'FB', width: 700, height: 1575, src: '04_FB.webp' },
    { name: 'IM8', width: 700, height: 1435, src: '05_IM8.webp' },
    { name: 'MAC', width: 700, height: 1281, src: '06_MAC.webp' },
    { name: 'BOOM', width: 700, height: 1490, src: '07_BOOM.webp' },
    { name: 'FLING', width: 700, height: 1657, src: '08_FLING.webp' },
  ];

  const pixelsPerSecond = 26; // Increase for faster scrolling.
  const wall = document.getElementById('wall');
  const notice = document.getElementById('notice');
  const pause = document.getElementById('pause');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const columns = [];
  let paused = false;
  let previousTime = null;

  // Mix images across three columns; the middle column scrolls the opposite way.
  [[0, 3, 6], [1, 4, 7], [2, 5, 8]].forEach((indices, index) => {
    const column = document.createElement('div');
    column.className = 'column';
    const track = document.createElement('div');
    track.className = 'track';
    const group = document.createElement('div');
    group.className = 'group';
    indices.forEach(i => {
      const item = images[i];
      if (!item) return;
      const figure = document.createElement('figure');
      figure.className = 'card';
      const img = document.createElement('img');
      img.src = item.src;
      img.alt = item.name + ' email campaign';
      img.width = item.width;
      img.height = item.height;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.draggable = false;
      img.addEventListener('error', () => { notice.textContent = 'An image could not load.'; });
      figure.append(img);
      group.append(figure);
    });
    track.append(group);
    column.append(track);
    wall.append(column);
    columns.push({ track, group, height: 0, phase: [0, 0.22, 0.12][index], direction: index === 1 ? -1 : 1 });
  });

  function paint(column) {
    column.track.style.transform = `translate3d(0, ${-column.phase * column.height}px, 0)`;
  }

  // Repeat enough content to fill even narrow, tall viewports.
  // Each loop distance includes the final gap for a seamless join.
  function measure() {
    columns.forEach(column => {
      const height = column.group.getBoundingClientRect().height;
      if (!height) return;
      column.height = height;
      const copies = Math.ceil(wall.clientHeight / height) + 1;
      while (column.track.children.length > 1) column.track.lastElementChild.remove();
      for (let i = 0; i < copies; i++) {
        const copy = column.group.cloneNode(true);
        copy.setAttribute('aria-hidden', 'true');
        column.track.append(copy);
      }
      paint(column);
    });
  }

  const observer = new ResizeObserver(measure);
  observer.observe(wall);
  columns.forEach(column => observer.observe(column.group));
  measure();

  function animate(time) {
    const elapsed = previousTime === null ? 0 : Math.min((time - previousTime) / 1000, 0.05);
    previousTime = time;
    if (!paused && !reducedMotion.matches && !document.hidden) {
      columns.forEach(column => {
        if (!column.height) return;
        column.phase = (column.phase + column.direction * pixelsPerSecond * elapsed / column.height + 1) % 1;
        paint(column);
      });
    }
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);

  // Deliberately no hover handlers: moving the pointer never pauses the wall.
  const pauseText = pause.querySelector('.pause-text');
  pause.addEventListener('click', () => {
    paused = !paused;
    pauseText.textContent = paused ? 'Play' : 'Pause';
    pause.classList.toggle('is-paused', paused);
    pause.setAttribute('aria-pressed', String(paused));
  });

  function syncMotionPreference() {
    wall.classList.toggle('reduced', reducedMotion.matches);
    pause.hidden = reducedMotion.matches;
    previousTime = null;
  }
  reducedMotion.addEventListener('change', syncMotionPreference);
  syncMotionPreference();
  document.addEventListener('visibilitychange', () => { previousTime = null; });
})();

// Optional real assets (logo, portrait): try each likely extension in turn,
// falling back to the built-in placeholder if none of them exist.
(() => {
  function loadFirst(img, candidates, onSuccess, onFail) {
    let i = 0;
    function tryNext() {
      if (i >= candidates.length) { onFail && onFail(); return; }
      img.src = candidates[i++];
    }
    img.addEventListener('error', tryNext);
    if (onSuccess) img.addEventListener('load', onSuccess, { once: true });
    tryNext();
  }

  // Checked in both assets/ and the repo root, since a manual GitHub upload
  // may land in either place.
  const logoImg = document.getElementById('logo-img');
  const logoFallback = document.getElementById('logo-fallback');
  if (logoImg) {
    loadFirst(
      logoImg,
      [
        'assets/logo.png', 'assets/logo.jpg', 'assets/logo.jpeg', 'assets/logo.svg', 'assets/logo.webp',
        'logo.png', 'logo.jpg', 'logo.jpeg', 'logo.svg', 'logo.webp',
      ],
      () => { logoFallback.hidden = true; },
      () => { logoImg.remove(); }
    );
  }

  const portraitImg = document.getElementById('portrait-img');
  if (portraitImg) {
    loadFirst(
      portraitImg,
      [
        'assets/portrait.jpg', 'assets/portrait.jpeg', 'assets/portrait.png', 'assets/portrait.webp',
        'portrait.jpg', 'portrait.jpeg', 'portrait.png', 'portrait.webp',
      ],
      null,
      () => { portraitImg.remove(); }
    );
  }
})();
