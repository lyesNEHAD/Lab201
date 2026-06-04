// ─── BASE PATH (works locally AND on GitHub Pages subfolder) ──
const BASE = new URL('../', import.meta.url).href;

// ─── PAGES À INJECTER ─────────────────────────────────────
const pages = [
  { html: `${BASE}main.html`,        css: `${BASE}styles/index.css`,   id: 'sec-home'    },
  { html: `${BASE}artiste.html`,      css: `${BASE}styles/artiste.css`, id: 'sec-artiste' },
  { html: `${BASE}html/foundry.html`, css: `${BASE}styles/foundry.css`, id: 'sec-foundry' },
  { html: `${BASE}html/tour.html`,    css: `${BASE}styles/tour.css`,    id: 'sec-tour'    },
  { html: `${BASE}html/footer.html`,  css: `${BASE}styles/footer.css`,  id: 'sec-footer'  },
];

function loadCSS(href) {
  if (!document.querySelector(`link[href="${href}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }
}

function injectAnimationCSS() {
  const style = document.createElement('style');
  style.textContent = `
    .reveal {
      opacity: 0;
      transform: translateY(32px);
      transition: opacity 0.7s cubic-bezier(.22,1,.36,1), transform 0.7s cubic-bezier(.22,1,.36,1);
    }
    .reveal.visible { opacity: 1; transform: translateY(0); }

    .reveal-left {
      opacity: 0;
      transform: translateX(-40px);
      transition: opacity 0.7s cubic-bezier(.22,1,.36,1), transform 0.7s cubic-bezier(.22,1,.36,1);
    }
    .reveal-left.visible { opacity: 1; transform: translateX(0); }

    .reveal-right {
      opacity: 0;
      transform: translateX(40px);
      transition: opacity 0.7s cubic-bezier(.22,1,.36,1), transform 0.7s cubic-bezier(.22,1,.36,1);
    }
    .reveal-right.visible { opacity: 1; transform: translateX(0); }

    .reveal-delay-1 { transition-delay: 0.1s; }
    .reveal-delay-2 { transition-delay: 0.2s; }
    .reveal-delay-3 { transition-delay: 0.3s; }
    .reveal-delay-4 { transition-delay: 0.4s; }
    .reveal-delay-5 { transition-delay: 0.5s; }

    nav {
      transition: background 0.4s ease, box-shadow 0.4s ease !important;
    }
    nav.scrolled {
      background: rgba(20, 6, 2, 0.85) !important;
      box-shadow: 0 2px 24px rgba(0,0,0,0.5) !important;
      backdrop-filter: blur(12px) !important;
    }
    nav .nav-links a { position: relative; }
    nav .nav-links a::after {
      content: '';
      position: absolute;
      bottom: -3px; left: 0;
      width: 0; height: 1px;
      background: currentColor;
      transition: width 0.25s ease;
    }
    nav .nav-links a:hover::after,
    nav .nav-links a.active::after { width: 100%; }
    nav .nav-links a.active { opacity: 1 !important; }

    .tour-row {
      transition: background 0.2s, transform 0.2s, box-shadow 0.2s !important;
    }
    .tour-row:hover {
      transform: translateX(6px) !important;
      box-shadow: -4px 0 0 0 #f07820 !important;
    }

    .tour-btn { position: relative; overflow: hidden; }
    .tour-btn::before {
      content: '';
      position: absolute; inset: 0;
      background: rgba(255,255,255,0.15);
      transform: translateX(-100%);
      transition: transform 0.3s ease;
    }
    .tour-btn:hover::before { transform: translateX(0); }

    .social-link svg {
      transition: transform 0.2s ease, color 0.2s ease !important;
    }
    .social-link:hover svg {
      transform: scale(1.2) translateY(-2px) !important;
    }

    .album-card {
      transition: transform 0.25s cubic-bezier(.22,1,.36,1);
    }
    .album-card:hover { transform: translateY(-6px); }

    .tracklist tr.active .track-name {
      font-weight: 700 !important;
      color: #c93c1a !important;
    }

    .btn-primary { position: relative; overflow: hidden; }
    .btn-primary::after {
      content: '';
      position: absolute; inset: 0;
      background: rgba(255,255,255,0.12);
      transform: scaleX(0);
      transform-origin: left;
      transition: transform 0.3s ease;
    }
    .btn-primary:hover::after { transform: scaleX(1); }

    a[data-target].active {
      opacity: 1 !important;
      font-weight: 500 !important;
    }
  `;
  document.head.appendChild(style);
}

// ─── SCROLL REVEAL ────────────────────────────────────────
function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), 80);
      } else {
        entry.target.classList.remove('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
    observer.observe(el);
  });
}

function addRevealClasses() {
  document.querySelectorAll('.tour-row').forEach((row, i) => {
    row.classList.add('reveal', `reveal-delay-${Math.min(i + 1, 5)}`);
  });

  document.querySelectorAll('.album-card').forEach((card, i) => {
    card.classList.add('reveal', `reveal-delay-${Math.min(i + 1, 5)}`);
  });

  const artisteVisual = document.querySelector('.artiste-visual');
  const artisteContent = document.querySelector('.artiste-content');
  if (artisteVisual) artisteVisual.classList.add('reveal-left');
  if (artisteContent) artisteContent.classList.add('reveal-right');

  const newsletterEl = document.querySelector('.newsletter');
  const socialEl = document.querySelector('.social-icons');
  const creditsEl = document.querySelector('.footer-credits');
  if (newsletterEl) newsletterEl.classList.add('reveal');
  if (socialEl) socialEl.classList.add('reveal', 'reveal-delay-2');
  if (creditsEl) creditsEl.classList.add('reveal', 'reveal-delay-3');

  const albumInfo = document.querySelector('.album-info');
  const tracklistPanel = document.querySelector('.tracklist-panel');
  if (albumInfo) albumInfo.classList.add('reveal-right');
  if (tracklistPanel) tracklistPanel.classList.add('reveal-right', 'reveal-delay-2');

  const tourTitle = document.querySelector('.tour-title');
  if (tourTitle) tourTitle.classList.add('reveal');
}

// ─── NAVBAR SCROLL ────────────────────────────────────────
function initNavScroll() {
  const nav = document.querySelector('nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

// ─── NAV SMOOTH SCROLL ────────────────────────────────────
function initNav() {
  const sectionIds = ['sec-home', 'sec-artiste', 'sec-foundry', 'sec-tour'];
  document.querySelectorAll('.nav-links a').forEach((link, i) => {
    if (sectionIds[i]) {
      link.setAttribute('data-target', sectionIds[i]);
      link.addEventListener('click', e => {
        e.preventDefault();
        const target = document.getElementById(sectionIds[i]);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      });
    }
  });
}

// ─── SCROLL SPY ───────────────────────────────────────────
function initScrollSpy() {
  const sections = document.querySelectorAll('.page-section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[data-target]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(l =>
        l.classList.toggle('active', l.dataset.target === entry.target.id)
      );
    });
  }, { threshold: 0.4 });
  sections.forEach(s => observer.observe(s));
}

// ─── MINI PLAYER ──────────────────────────────────────────
function initMiniPlayer() {
  document.querySelectorAll('.tracklist tr').forEach(track => {
    track.addEventListener('click', () => {
      document.querySelectorAll('.tracklist tr').forEach(t => t.classList.remove('active'));
      track.classList.add('active');
      const name = track.querySelector('.track-name')?.textContent ?? '';
      const dur  = track.querySelector('.track-dur')?.textContent  ?? '';
      const title = document.querySelector('.player-track');
      const fill  = document.querySelector('.progress-fill');
      const thumb = document.querySelector('.progress-thumb');
      const times = document.querySelectorAll('.player-time');
      if (title) title.textContent = name;
      if (fill)  fill.style.width  = '0%';
      if (thumb) thumb.style.left  = '0%';
      if (times[0]) times[0].textContent = '0:00';
      if (times[1]) times[1].textContent = dur;
    });
  });
}

// ─── AUTO SCROLL ALBUMS ───────────────────────────────────
function initAlbumsScroll() {
  const interval = setInterval(() => {
    const grid = document.querySelector('.albums-grid');
    if (!grid) return;
    clearInterval(interval);
    let scrollAmount = 0;
    let paused = false;
    grid.addEventListener('mouseenter', () => paused = true);
    grid.addEventListener('mouseleave', () => paused = false);
    setInterval(() => {
      if (paused) return;
      scrollAmount += 1;
      if (scrollAmount >= grid.scrollWidth - grid.clientWidth) {
        scrollAmount = 0;
      }
      grid.scrollLeft = scrollAmount;
    }, 20);
  }, 200);
}

// ─── TOUR DATES FIREBASE ──────────────────────────────────
function initTourDates() {
  const interval = setInterval(() => {
    const list = document.getElementById('tour-list');
    if (!list) return;
    clearInterval(interval);

    function formatDate(str) {
      if (!str) return '—';
      const [y, m, d] = str.split('-');
      return `${d}/${m}`;
    }

    function esc(s) {
      return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    function renderDates(dates) {
      list.querySelectorAll('.tour-row, .tour-empty').forEach(r => r.remove());
      const loading = document.getElementById('tour-loading');
      if (loading) loading.style.display = 'none';

      if (!dates.length) {
        const empty = document.createElement('div');
        empty.className = 'tour-empty';
        empty.textContent = 'Aucune date annoncée pour le moment.';
        list.appendChild(empty);
        return;
      }

      dates.forEach((d) => {
        const row = document.createElement('div');
        row.className = 'tour-row';
        row.innerHTML = `
          <div class="tour-info">
            <p class="tour-event">${esc(d.event || '—')}</p>
            <p class="tour-album">${esc(d.lieu || '')}</p>
          </div>
          <p class="tour-date">${formatDate(d.date)}</p>
          <p class="tour-city">${esc(d.ville || '—')}, ${esc(d.pays || '—')}</p>
          ${d.soldout
            ? `<span class="tour-btn soldout">COMPLET</span>`
            : `<a class="tour-btn" href="${esc(d.tickets || '#')}" target="_blank">TICKETS</a>`
          }
        `;
        list.appendChild(row);
      });

      list.querySelectorAll('.tour-row').forEach((row, i) => {
        row.classList.add('reveal', `reveal-delay-${Math.min(i + 1, 5)}`);
      });
      initReveal();
    }

    function showTourError(err) {
      console.error(err);
      const loading = document.getElementById('tour-loading');
      if (loading) loading.textContent = 'Erreur de chargement.';
    }

    function loadTourDatesRest(fetchTourDatesRest) {
      return fetchTourDatesRest().then(renderDates).catch(showTourError);
    }

    import('./firebase.js').then(({ onSnapshotTourDates, fetchTourDatesRest }) => {
      onSnapshotTourDates(renderDates, (err) => {
        console.error(err);
        loadTourDatesRest(fetchTourDatesRest);
      });
    }).catch((err) => {
      console.error('Impossible de charger Firebase:', err);
      showTourError(err);
    });
  }, 300);
}

// ─── CHARGER LES PAGES ────────────────────────────────────
async function loadPages() {
  injectAnimationCSS();

  let container = document.getElementById('pages-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'pages-container';
    document.body.appendChild(container);
  }

  for (const page of pages) {
    try {
      loadCSS(page.css);
      const res = await fetch(page.html);
      if (!res.ok) throw new Error(`HTTP ${res.status} — ${page.html}`);
      const html = await res.text();
      const doc  = new DOMParser().parseFromString(html, 'text/html');
      const content = doc.querySelector('section') || doc.querySelector('main');

      if (content) {
        if (page.id === 'sec-home') {
          const nav = doc.querySelector('nav');
          if (nav && !document.querySelector('nav')) {
            document.body.insertBefore(nav, container);
          }
        }

        content.querySelectorAll('nav').forEach(n => n.remove());
        content.id = page.id;
        content.classList.add('page-section');
        container.appendChild(content);
      } else {
        console.warn(`Pas de <section> dans ${page.html}`);
      }
    } catch (e) {
      console.error(`Impossible de charger ${page.html}:`, e);
    }
  }

  addRevealClasses();
  initReveal();
  initNav();
  initNavScroll();
  initScrollSpy();
  initMiniPlayer();
  initAlbumsScroll();
  initTourDates();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadPages);
} else {
  loadPages();
}
