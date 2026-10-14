(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.primary-nav');
  if (menuButton && menu) {
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!open));
      menuButton.setAttribute('aria-label', open ? 'Open navigation' : 'Close navigation');
      menu.classList.toggle('is-open', !open);
    });
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open navigation');
      menu.classList.remove('is-open');
    }));
  }

  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  const notes = Array.isArray(window.NOTE_CATALOG) ? window.NOTE_CATALOG : [];
  const results = document.getElementById('note-results');
  if (!results || !notes.length) return;

  const count = document.getElementById('note-count');
  const controls = document.getElementById('note-controls');
  const search = document.getElementById('note-search');
  const filters = document.getElementById('tag-filters');
  let activeTag = 'All';
  let query = '';
  if (count) count.textContent = `${notes.length} ${notes.length === 1 ? 'note' : 'notes'} in the collection`;
  if (controls) controls.hidden = false;

  const tags = ['All', ...new Set(notes.flatMap(note => note.tags || []))];
  for (const tag of tags) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'filter-button' + (tag === activeTag ? ' is-active' : '');
    button.textContent = tag;
    button.setAttribute('aria-pressed', String(tag === activeTag));
    button.addEventListener('click', () => {
      activeTag = tag;
      filters.querySelectorAll('button').forEach(item => {
        const selected = item.textContent === tag;
        item.classList.toggle('is-active', selected);
        item.setAttribute('aria-pressed', String(selected));
      });
      render();
    });
    filters.append(button);
  }

  function render() {
    const matched = notes.filter(note => {
      const inTag = activeTag === 'All' || (note.tags || []).includes(activeTag);
      const haystack = `${note.title} ${note.summary} ${(note.tags || []).join(' ')}`.toLowerCase();
      return inTag && haystack.includes(query);
    });
    results.replaceChildren();
    if (!matched.length) {
      const empty = document.createElement('div');
      empty.className = 'empty-notes';
      empty.innerHTML = '<span class="empty-icon" aria-hidden="true">⌕</span><h3>No matching notes.</h3><p>Try a different search or topic.</p>';
      results.append(empty);
      return;
    }
    for (const note of matched) {
      const card = document.createElement('article');
      card.className = 'note-card';
      const date = document.createElement('span');
      date.className = 'note-date';
      date.textContent = note.date || 'Research note';
      const title = document.createElement('h3');
      const anchor = document.createElement('a');
      anchor.href = note.file;
      anchor.textContent = note.title;
      title.append(anchor);
      const summary = document.createElement('p');
      summary.textContent = note.summary;
      const tagsLine = document.createElement('div');
      tagsLine.className = 'note-tags';
      for (const tag of note.tags || []) {
        const item = document.createElement('span');
        item.textContent = tag;
        tagsLine.append(item);
      }
      const arrow = document.createElement('span');
      arrow.className = 'note-arrow';
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = '↗';
      card.append(date, title, summary, tagsLine, arrow);
      results.append(card);
    }
  }
  if (search) search.addEventListener('input', () => { query = search.value.trim().toLowerCase(); render(); });
  render();
})();
