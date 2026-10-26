import config from '../config.json';
import members from '../members.json';

const photoFiles = import.meta.glob('../assets/photos/*.webp', { eager: true, query: '?url', import: 'default' });
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ---------- 유틸 ---------- */
function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === null || value === undefined || value === false) continue;
    if (key === 'class') node.className = value;
    else if (key === 'text') node.textContent = value;
    else if (key === 'html') node.innerHTML = value;
    else if (key.startsWith('on')) node.addEventListener(key.slice(2), value);
    else node.setAttribute(key, value === true ? '' : value);
  }
  for (const child of [].concat(children)) {
    if (child === null || child === undefined || child === false) continue;
    node.append(child);
  }
  return node;
}

const ICONS = {
  github:
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2.17c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.42-2.7 5.39-5.26 5.68.41.36.78 1.06.78 2.13v3.16c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"/></svg>',
  external:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6"/><path d="M20 4 10 14"/><path d="M19 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h6"/></svg>',
  close:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
};

const isReady = (m) => m.status === 'ready';
const initialOf = (m) => (m.name || '?').trim().charAt(0);
const photoUrl = (m, size) => (m.photo ? photoFiles[`../assets/photos/${m.photo}-${size}.webp`] ?? null : null);
const showsPhoto = (m) => isReady(m) && m.consent === true && Boolean(photoUrl(m, 480));

function externalLink(href, label, { icon = 'external', text = null } = {}) {
  return el('a', {
    class: text ? 'text-link' : 'icon-link',
    href,
    target: '_blank',
    rel: 'noopener noreferrer',
    'aria-label': text ? null : label,
    html: ICONS[icon] + (text ? `<span>${text}</span>` : ''),
  });
}

function linkRow(m, withText = false) {
  const links = [];
  if (m.links?.github) links.push(externalLink(m.links.github, `${m.name} GitHub`, { icon: 'github', text: withText ? 'GitHub' : null }));
  if (m.links?.portfolio) links.push(externalLink(m.links.portfolio, `${m.name} 포트폴리오`, { icon: 'external', text: withText ? '포트폴리오' : null }));
  return links.length ? el('div', { class: 'card-links' }, links) : null;
}

function badges(m) {
  const items = [];
  if (m.role) items.push(el('span', { class: 'badge', text: m.role }));
  if (m.roleAlt) items.push(el('span', { class: 'badge alt', text: m.roleAlt }));
  return items.length ? el('div', { class: 'badges' }, items) : null;
}

/* ---------- 설정 텍스트 ---------- */
document.querySelectorAll('[data-config]').forEach((node) => {
  node.textContent = config[node.dataset.config] ?? '';
});
document.title = `${config.teamName} | ${config.subtitle}`;

/* ---------- 히어로 팀명 ---------- */
function renderTeamName() {
  const h1 = document.getElementById('team-name');
  h1.setAttribute('aria-label', config.teamName);
  h1.replaceChildren();
  const words = config.teamName.trim().split(/\s+/);
  let index = 0;
  let width = 0;
  for (const word of words) {
    const wordEl = el('span', { class: 'word', 'aria-hidden': 'true' });
    for (const ch of [...word]) {
      wordEl.append(el('span', { class: 'ch', text: ch, style: `--i:${index++}` }));
      width += /[ᄀ-ᇿ㄰-㆏가-힯぀-ヿ一-鿿]/.test(ch) ? 1 : 0.62;
    }
    h1.append(wordEl);
  }
  width += (words.length - 1) * 0.22;
  document.documentElement.style.setProperty('--title-w', Math.max(1, width * 0.97).toFixed(2));
}

function renderTagline() {
  const node = document.getElementById('tagline');
  node.replaceChildren();
  const text = config.tagline || '';
  const mark = config.taglineHighlight;
  if (mark && text.includes(mark)) {
    const [before, ...rest] = text.split(mark);
    node.append(before, el('span', { class: 'mark', text: mark }), rest.join(mark));
  } else {
    node.textContent = text;
  }
}

function renderAvatarStack() {
  const stack = document.getElementById('avatar-stack');
  for (const m of members) {
    const avatar = el('span', { class: `avatar${isReady(m) ? ' is-ready' : ''}`, role: 'listitem', title: m.name });
    if (showsPhoto(m)) {
      avatar.append(el('img', { src: photoUrl(m, 480), alt: m.name, width: 48, height: 48, loading: 'eager' }));
    } else {
      avatar.append(el('span', { text: initialOf(m), 'aria-hidden': 'true' }));
      avatar.append(el('span', { class: 'sr-only', text: m.name }));
    }
    stack.append(avatar);
  }
}

/* ---------- 한눈에 보기 ---------- */
function renderStats() {
  const ready = members.filter(isReady);
  const stats = [
    { label: '팀원', value: members.length, unit: '명' },
    { label: '프로필 공개', value: ready.length, unit: '명' },
    { label: '대표 경력과 수상', value: ready.reduce((sum, m) => sum + (m.highlights?.length ?? 0), 0), unit: '건' },
  ];
  const dl = document.getElementById('stats');
  stats.forEach((s, i) => {
    const value = el('span', { class: 'stat-num', text: reduced ? String(s.value) : '0', 'data-target': s.value });
    dl.append(
      el('div', { class: 'stat reveal', style: `--reveal-delay:${i * 90}ms` }, [
        el('dd', { class: 'stat-value' }, [value, el('small', { text: s.unit })]),
        el('dt', { class: 'stat-label', text: s.label }),
      ]),
    );
  });
  if (reduced) return;
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        io.unobserve(entry.target);
        entry.target.querySelectorAll('.stat-num').forEach(countUp);
      }
    },
    { threshold: 0.4 },
  );
  io.observe(dl);
}

function countUp(node) {
  const target = Number(node.dataset.target);
  const duration = 1100;
  const start = performance.now();
  const tick = (now) => {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    node.textContent = String(Math.round(target * eased));
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* ---------- 팀원 카드 ---------- */
function renderCards() {
  const grid = document.getElementById('member-grid');
  members.forEach((m, i) => {
    grid.append(isReady(m) ? readyCard(m, i) : pendingCard(m, i));
  });
}

function photoBlock(m, size, className) {
  const box = el('div', { class: className });
  if (showsPhoto(m)) {
    box.append(el('img', { src: photoUrl(m, size), alt: `${m.name} 사진`, width: size, height: Math.round((size * 4) / 3), loading: 'lazy', decoding: 'async' }));
  } else {
    box.append(el('div', { class: 'initial', text: initialOf(m), 'aria-hidden': 'true' }));
  }
  return box;
}

function readyCard(m, i) {
  const top3 = (m.highlights ?? []).slice(0, 3);
  const rest = (m.highlights?.length ?? 0) - top3.length;
  const card = el('li', { class: 'card reveal', style: `--reveal-delay:${(i % 3) * 80}ms`, 'data-id': m.id }, [
    photoBlock(m, 480, 'card-photo'),
    el('div', { class: 'card-body' }, [
      el('div', { class: 'card-head' }, [
        el('h3', { class: 'card-name' }, [
          el('button', { class: 'card-open', type: 'button', onclick: () => openModal(m, card) }, [m.name, el('span', { class: 'sr-only', text: ' 상세 보기' })]),
        ]),
      ]),
      badges(m),
      m.education?.length ? el('ul', { class: 'edu' }, m.education.map((e) => el('li', { text: e }))) : null,
      m.intro ? el('p', { class: 'intro', text: m.intro }) : null,
      top3.length
        ? el('ul', { class: 'hl' }, [
            ...top3.map((h) => el('li', { text: h })),
            rest > 0 ? el('li', { class: 'hl-more', text: `외 ${rest}건, 카드를 눌러 전체 보기` }) : null,
          ])
        : null,
      linkRow(m),
    ]),
  ]);
  attachTilt(card);
  return card;
}

function pendingCard(m, i) {
  return el('li', { class: 'card is-pending reveal', style: `--reveal-delay:${(i % 3) * 80}ms`, 'data-id': m.id }, [
    photoBlock(m, 480, 'card-photo'),
    el('div', { class: 'card-body' }, [
      el('div', { class: 'card-head' }, [el('h3', { class: 'card-name', text: m.name })]),
      el('span', { class: 'pending-label', text: '프로필 준비 중' }),
      el('div', { class: 'skeleton', 'aria-hidden': 'true' }, [el('span'), el('span'), el('span')]),
    ]),
  ]);
}

function attachTilt(card) {
  if (reduced || !finePointer) return;
  const max = 6;
  let raf = 0;
  card.addEventListener('pointermove', (e) => {
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      card.classList.add('is-tilting');
      card.style.transform = `perspective(1000px) rotateX(${(-py * max * 2).toFixed(2)}deg) rotateY(${(px * max * 2).toFixed(2)}deg) translateY(-2px)`;
    });
  });
  card.addEventListener('pointerleave', () => {
    cancelAnimationFrame(raf);
    card.classList.remove('is-tilting');
    card.style.transform = '';
  });
}

/* ---------- 모달 ---------- */
const dialog = document.getElementById('member-modal');
const modalInner = document.getElementById('modal-inner');
let lastTrigger = null;
let lastCardImg = null;

function buildModal(m) {
  modalInner.replaceChildren(
    photoBlock(m, 960, 'modal-photo'),
    el('div', { class: 'modal-content' }, [
      el('div', { class: 'modal-top' }, [
        el('div', {}, [el('h2', { class: 'modal-name', id: 'modal-name', text: m.name }), badges(m)]),
        el('button', { class: 'modal-close', type: 'button', 'aria-label': '닫기', html: ICONS.close, onclick: closeModal }),
      ]),
      m.education?.length ? el('section', {}, [el('h3', { text: '학력과 교육' }), el('ul', { class: 'edu' }, m.education.map((e) => el('li', { text: e })))]) : null,
      m.intro ? el('p', { class: 'intro', text: m.intro }) : null,
      m.highlights?.length ? el('section', {}, [el('h3', { text: '대표 경력과 수상' }), el('ul', { class: 'hl' }, m.highlights.map((h) => el('li', { text: h })))]) : null,
      m.agentExp ? el('section', {}, [el('h3', { text: '에이전트 경험' }), el('p', { class: 'intro', text: m.agentExp })]) : null,
      m.extraEducation?.length ? el('section', {}, [el('h3', { text: '추가 교육' }), el('ul', { class: 'edu' }, m.extraEducation.map((e) => el('li', { text: e })))]) : null,
      linkRow(m, true),
    ]),
  );
  modalInner.querySelector('.badges')?.style.setProperty('margin-top', '10px');
}

function withTransition(update) {
  if (reduced || typeof document.startViewTransition !== 'function') {
    update();
    return Promise.resolve();
  }
  return document.startViewTransition(update).finished.catch(() => {});
}

function openModal(m, card) {
  lastTrigger = card.querySelector('.card-open');
  lastCardImg = card.querySelector('.card-photo img');
  buildModal(m);
  if (lastCardImg) lastCardImg.style.viewTransitionName = 'member-photo';
  withTransition(() => {
    if (lastCardImg) lastCardImg.style.viewTransitionName = '';
    const img = modalInner.querySelector('.modal-photo img');
    if (img) img.style.viewTransitionName = 'member-photo';
    dialog.showModal();
    modalInner.scrollTop = 0;
  }).then(() => {
    const img = modalInner.querySelector('.modal-photo img');
    if (img) img.style.viewTransitionName = '';
  });
}

function closeModal() {
  if (!dialog.open) return;
  const img = modalInner.querySelector('.modal-photo img');
  if (img) img.style.viewTransitionName = 'member-photo';
  withTransition(() => {
    if (img) img.style.viewTransitionName = '';
    if (lastCardImg) lastCardImg.style.viewTransitionName = 'member-photo';
    dialog.close();
  }).then(() => {
    if (lastCardImg) lastCardImg.style.viewTransitionName = '';
    lastTrigger?.focus();
  });
}

dialog.addEventListener('click', (e) => {
  if (e.target === dialog) closeModal();
});
dialog.addEventListener('cancel', (e) => {
  e.preventDefault();
  closeModal();
});
dialog.addEventListener('keydown', (e) => {
  if (e.key !== 'Tab') return;
  const focusables = [...dialog.querySelectorAll('button, a[href]')].filter((n) => !n.disabled);
  if (!focusables.length) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
});

/* ---------- 일하는 방식 ---------- */
function renderPrinciples() {
  const list = document.getElementById('principle-list');
  (config.principles ?? []).forEach((p, i) => {
    list.append(
      el('li', { class: 'principle reveal', style: `--reveal-delay:${i * 90}ms` }, [
        el('span', { class: 'principle-num', text: String(i + 1).padStart(2, '0'), 'aria-hidden': 'true' }),
        el('div', {}, [el('h3', { class: 'principle-title', text: p.title }), el('p', { class: 'principle-body', text: p.body })]),
      ]),
    );
  });
  document.querySelector('#principles .section-title')?.classList.add('reveal');
  document.querySelector('#members .section-title')?.classList.add('reveal');
  document.querySelector('#glance .section-title')?.classList.add('reveal');
}

/* ---------- 등장 폴백 (animation-timeline 미지원) ---------- */
function setupRevealFallback() {
  if (CSS.supports('animation-timeline: view()')) return;
  const nodes = document.querySelectorAll('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    nodes.forEach((n) => n.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.1 },
  );
  nodes.forEach((n) => io.observe(n));
}

/* ---------- 히어로 빛 ---------- */
function setupGlow() {
  const hero = document.getElementById('hero');
  const glow = hero.querySelector('.glow');
  if (!glow || reduced || !finePointer) return;
  let tx = window.innerWidth * 0.55;
  let ty = window.innerHeight * 0.35;
  let cx = tx;
  let cy = ty;
  let running = false;
  const step = () => {
    cx += (tx - cx) * 0.06;
    cy += (ty - cy) * 0.06;
    glow.style.setProperty('--gx', `${cx.toFixed(1)}px`);
    glow.style.setProperty('--gy', `${cy.toFixed(1)}px`);
    if (Math.abs(tx - cx) > 0.5 || Math.abs(ty - cy) > 0.5) requestAnimationFrame(step);
    else running = false;
  };
  window.addEventListener('pointermove', (e) => {
    const rect = hero.getBoundingClientRect();
    if (rect.bottom < 0) return;
    tx = e.clientX - rect.left;
    ty = e.clientY - rect.top;
    if (!running) {
      running = true;
      requestAnimationFrame(step);
    }
  }, { passive: true });
  step();
}

/* ---------- 테마 토글 ---------- */
function setupTheme() {
  const root = document.documentElement;
  const button = document.getElementById('theme-toggle');
  const label = document.getElementById('theme-toggle-label');
  const system = window.matchMedia('(prefers-color-scheme: light)');
  const current = () => root.getAttribute('data-theme') || (system.matches ? 'light' : 'dark');
  const paint = () => {
    const theme = current();
    label.textContent = theme === 'dark' ? '화면 밝게' : '화면 어둡게';
    button.setAttribute('aria-pressed', root.hasAttribute('data-theme') ? 'true' : 'false');
  };
  button.addEventListener('click', () => {
    const next = current() === 'dark' ? 'light' : 'dark';
    const systemTheme = system.matches ? 'light' : 'dark';
    const apply = () => {
      // 시스템 설정과 같아지면 저장값을 지워서 다시 시스템을 따르게 둔다
      if (next === systemTheme) {
        root.removeAttribute('data-theme');
        try { localStorage.removeItem('theme'); } catch {}
      } else {
        root.setAttribute('data-theme', next);
        try { localStorage.setItem('theme', next); } catch {}
      }
      paint();
    };
    withTransition(apply);
  });
  system.addEventListener('change', paint);
  paint();
}

/* ---------- 실행 ---------- */
renderTeamName();
renderTagline();
renderAvatarStack();
renderStats();
renderCards();
renderPrinciples();
setupRevealFallback();
setupGlow();
setupTheme();
