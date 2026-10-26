import config from '../config.json';
import members from '../members.json';

const photoFiles = import.meta.glob('../assets/photos/*.webp', { eager: true, query: '?url', import: 'default' });
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduced) document.documentElement.classList.add('js-motion');
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
  slack:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M9 3v8M15 13v8M3 15h8M13 9h8"/></svg>',
  notion:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 16V8l6 8V8"/></svg>',
  wbs:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h9M7 12h10M10 18h10"/></svg>',
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
const ROLE_ORDER = ['PM', 'AI', 'BE', 'FE'];
const normRole = (r = '') => {
  const v = r.trim().toUpperCase();
  if (v.startsWith('FRONT') || v === 'FE') return 'FE';
  if (v.startsWith('BACK') || v === 'BE') return 'BE';
  return v;
};

function renderStats() {
  const ready = members.filter(isReady);
  const counts = {};
  for (const m of members) {
    const r = normRole(m.role);
    if (r) counts[r] = (counts[r] ?? 0) + 1;
  }
  const roles = Object.keys(counts).sort((a, b) => (ROLE_ORDER.indexOf(a) + 99) % 99 - (ROLE_ORDER.indexOf(b) + 99) % 99);
  const dl = document.getElementById('stats');
  const highlightsTotal = ready.reduce((sum, m) => sum + (m.highlights?.length ?? 0), 0);

  // 숫자는 처음부터 최종값을 넣고, 카운트업은 화면에 들어올 때만 덧입힌다
  const numStat = (label, value, unit, i) =>
    el('div', { class: 'stat reveal', style: `--reveal-delay:${i * 90}ms` }, [
      el('dd', { class: 'stat-value' }, [el('span', { class: 'stat-num', text: String(value), 'data-target': value }), el('small', { text: unit })]),
      el('dt', { class: 'stat-label', text: label }),
    ]);
  dl.append(
    numStat('함께하는 팀원', members.length, '명', 0),
    el('div', { class: 'stat stat-roles reveal', style: '--reveal-delay:90ms' }, [
      el('dd', { class: 'stat-value roles' }, roles.map((r) => el('span', { class: 'role-count', 'data-role': r }, [el('b', { text: r }), el('span', { class: 'stat-num', text: String(counts[r]), 'data-target': counts[r] })]))),
      el('dt', { class: 'stat-label', text: '이렇게 나눠 맡아요' }),
    ]),
    numStat('지금까지 쌓은 경력과 수상', highlightsTotal, '건', 2),
  );
  if (reduced || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        io.unobserve(entry.target);
        entry.target.querySelectorAll('.stat-num').forEach(countUp);
      }
    },
    { threshold: 0.3 },
  );
  io.observe(dl);
}

function countUp(node) {
  const target = Number(node.dataset.target);
  if (!Number.isFinite(target) || target === 0) return;
  const duration = 1000;
  const start = performance.now();
  const tick = (now) => {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    node.textContent = String(Math.max(t < 1 ? 0 : target, Math.round(target * eased)));
    if (t < 1) requestAnimationFrame(tick);
    else node.textContent = String(target);
  };
  requestAnimationFrame(tick);
}

/* ---------- 팀원 조직도 ---------- */
const hopeText = (m) => {
  const parts = [];
  if (m.role) parts.push(`희망 1순위 ${m.role}`);
  if (m.roleAlt) parts.push(`2순위 ${m.roleAlt}`);
  return parts.join(' · ');
};

function roleChips(m, { large = false } = {}) {
  const items = [];
  if (m.teamRole) items.push(el('span', { class: `chip chip-main${large ? ' is-large' : ''}`, 'data-role': normRole(m.role), text: m.teamRole }));
  if (m.teamRoleSub) items.push(el('span', { class: 'chip chip-sub', text: m.teamRoleSub }));
  if (!items.length) {
    if (m.role) items.push(el('span', { class: 'chip chip-main', text: m.role }));
    if (m.roleAlt) items.push(el('span', { class: 'chip chip-sub', text: m.roleAlt }));
  }
  return items.length ? el('div', { class: 'chips' }, items) : null;
}

function keyStatBlock(m) {
  if (!m.keyStat) return null;
  return el('div', { class: 'keystat' }, [
    el('p', { class: 'keystat-value', text: m.keyStat }),
    m.keyStatLabel ? el('p', { class: 'keystat-label', text: m.keyStatLabel }) : null,
  ]);
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

function openButton(m, card) {
  return el('button', { class: 'card-open', type: 'button', onclick: () => openModal(m, card) }, [m.name, el('span', { class: 'sr-only', text: ' 상세 보기' })]);
}

function memberCard(m, { lead = false } = {}) {
  if (!isReady(m)) {
    return el('article', { class: 'card is-pending reveal', 'data-id': m.id }, [
      photoBlock(m, 480, 'card-photo'),
      el('div', { class: 'card-body' }, [
        el('h3', { class: 'card-name', text: m.name }),
        el('span', { class: 'pending-label', text: '프로필 곧 올라와요' }),
        el('div', { class: 'skeleton', 'aria-hidden': 'true' }, [el('span'), el('span'), el('span')]),
      ]),
    ]);
  }
  const card = el('article', { class: `card reveal${lead ? ' card-lead' : ''}`, 'data-id': m.id });
  const edu = (m.education ?? []).slice(0, 2);
  const body = el('div', { class: 'card-body' }, [
    lead && m.badge ? el('p', { class: 'lead-badge', text: m.badge }) : null,
    el('h3', { class: 'card-name' }, [openButton(m, card)]),
    roleChips(m, { large: true }),
    keyStatBlock(m),
    edu.length ? el('ul', { class: 'edu' }, edu.map((e) => el('li', { text: e }))) : null,
    lead && m.intro ? el('p', { class: 'intro', text: m.intro }) : null,
    lead && m.highlights?.length
      ? el('ul', { class: 'hl' }, m.highlights.slice(0, 2).map((h) => el('li', { text: h })))
      : null,
    hopeText(m) ? el('p', { class: 'hope', text: hopeText(m) }) : null,
    el('span', { class: 'more', 'aria-hidden': 'true', text: '자세히 보기' }),
  ]);
  card.append(el('span', { class: 'verified', text: '✓ VERIFIED', 'aria-hidden': 'true' }), photoBlock(m, lead ? 960 : 480, 'card-photo'), body);
  return card;
}

function renderOrg() {
  const root = document.getElementById('org');
  const sorted = [...members].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  const lead = sorted.find((m) => normRole(m.teamRole) === 'PM' || m.group === 'PM') ?? sorted[0];
  const rest = sorted.filter((m) => m !== lead);
  const groups = [];
  for (const m of rest) {
    const name = m.group || '팀원';
    let g = groups.find((x) => x.name === name);
    if (!g) groups.push((g = { name, members: [] }));
    g.members.push(m);
  }
  root.append(
    el('div', { class: 'org-top' }, [memberCard(lead, { lead: true })]),
    el('div', { class: 'org-stem', 'aria-hidden': 'true' }),
    el(
      'div',
      { class: `org-branches${groups.length > 1 ? ' is-split' : ''}`, style: `--branches:${groups.length}` },
      groups.map((g) =>
        el('section', { class: 'org-group', 'aria-label': g.name }, [
          el('span', { class: 'org-drop', 'aria-hidden': 'true' }),
          el('h3', { class: 'org-label', text: g.name }),
          el('div', { class: 'org-cards' }, g.members.map((m) => memberCard(m))),
        ]),
      ),
    ),
  );
}

function attachTilt(card) {
  if (reduced || !finePointer) return;
  const max = card.classList.contains('card-lead') ? 3 : 6;
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

function setupTyping() {
  const nodes = document.querySelectorAll('.org .keystat-value');
  if (reduced || !('IntersectionObserver' in window)) return;
  const type = (node) => {
    const full = node.dataset.full;
    const chars = [...full];
    const step = Math.max(12, Math.floor(480 / chars.length));
    let i = 0;
    node.textContent = '';
    node.classList.add('typing');
    const timer = setInterval(() => {
      i += 1;
      node.textContent = chars.slice(0, i).join('');
      if (i >= chars.length) {
        clearInterval(timer);
        node.classList.remove('typing');
      }
    }, step);
  };
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        io.unobserve(entry.target);
        type(entry.target);
      }
    },
    { threshold: 0.6 },
  );
  nodes.forEach((n) => {
    n.dataset.full = n.textContent;
    n.setAttribute('aria-label', n.textContent);
    io.observe(n);
  });
}

function setupOrgLines() {
  const lines = document.querySelectorAll('.org-stem, .org-branches, .org-drop');
  if (reduced || !('IntersectionObserver' in window)) {
    lines.forEach((n) => n.classList.add('drawn'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('drawn');
          io.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.2 },
  );
  lines.forEach((n) => io.observe(n));
}

/* ---------- 모달 ---------- */
const dialog = document.getElementById('member-modal');
const modalInner = document.getElementById('modal-inner');
let lastTrigger = null;
let lastCardImg = null;

function buildModal(m) {
  const sec = (title, node) => (node ? el('section', {}, [el('h3', { text: title }), node]) : null);
  const list = (arr, cls) => (arr?.length ? el('ul', { class: cls }, arr.map((x) => el('li', { text: x }))) : null);
  modalInner.replaceChildren(
    photoBlock(m, 960, 'modal-photo'),
    el('div', { class: 'modal-content' }, [
      el('div', { class: 'modal-top' }, [
        el('div', {}, [
          m.badge && normRole(m.teamRole) === 'PM' ? el('p', { class: 'lead-badge', text: m.badge }) : null,
          el('h2', { class: 'modal-name', id: 'modal-name', text: m.name }),
          roleChips(m),
          hopeText(m) ? el('p', { class: 'hope', text: hopeText(m) }) : null,
        ]),
        el('button', { class: 'modal-close', type: 'button', 'aria-label': '닫기', html: ICONS.close, onclick: closeModal }),
      ]),
      keyStatBlock(m),
      m.intro ? el('p', { class: 'intro', text: m.intro }) : null,
      sec('대표 경력과 수상', list(m.highlights, 'hl')),
      m.agentExp ? sec('에이전트 경험', el('p', { class: 'intro', text: m.agentExp })) : null,
      sec('학력과 교육', list(m.education, 'edu')),
      sec('연구실', list(m.labs, 'edu')),
      m.extraEducation?.length ? el('section', { class: 'extra' }, [el('h3', { text: '추가 교육' }), list(m.extraEducation, 'edu edu-small')]) : null,
      linkRow(m, true),
    ]),
  );
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

/* ---------- 팀 워크스페이스 ---------- */
function renderWorkspace() {
  const grid = document.getElementById('ws-grid');
  const items = config.workspace ?? [];
  if (!grid) return;
  if (!items.length) {
    document.getElementById('workspace')?.remove();
    return;
  }
  const iconFor = (label = '') => {
    const k = label.toLowerCase();
    if (k.includes('github')) return ICONS.github;
    if (k.includes('slack')) return ICONS.slack;
    if (k.includes('notion')) return ICONS.notion;
    if (k.includes('wbs')) return ICONS.wbs;
    return ICONS.external;
  };
  items.forEach((w, i) => {
    const active = Boolean(w.url);
    const inner = [
      el('span', { class: 'ws-icon', html: iconFor(w.label) }),
      el('span', { class: 'ws-text' }, [
        el('span', { class: 'ws-label', text: w.label }),
        w.desc ? el('span', { class: 'ws-desc', text: w.desc }) : null,
      ]),
      el('span', { class: `ws-state${active ? ' is-open' : ''}`, text: active ? (w.status || '바로 가기') : (w.status || '곧 열려요') }),
    ];
    const node = active
      ? el('a', { class: 'ws-card', href: w.url, target: '_blank', rel: 'noopener noreferrer', 'aria-label': `${w.label}, ${w.desc ?? ''} (새 탭)` }, inner)
      : el('div', { class: 'ws-card is-disabled', 'aria-disabled': 'true' }, inner);
    grid.append(el('li', { class: 'reveal', style: `--reveal-delay:${i * 70}ms` }, [node]));
  });
  document.querySelector('#workspace .section-title')?.classList.add('reveal');
}

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
    label.textContent = theme === 'dark' ? '밝게 보기' : '어둡게 보기';
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
renderOrg();
setupOrgLines();
setupTyping();
renderWorkspace();
renderPrinciples();
setupRevealFallback();
setupGlow();
setupTheme();
