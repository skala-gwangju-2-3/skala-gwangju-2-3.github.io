// 데스크톱(1440), 모바일(390) 스크린샷과 reduced-motion 검사를 수행합니다.
// 사용법: node scripts/shots.mjs [URL]  (기본: http://localhost:4173)
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const url = process.argv[2] || 'http://localhost:4173/';
const outDir = process.argv[3] || 'shots';
await mkdir(outDir, { recursive: true });
const browser = await chromium.launch();
const report = {};

async function shoot(name, viewport, opts = {}) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2, ...opts });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2600);
  const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
  await page.screenshot({ path: `${outDir}/${name}-hero.png` });
  // 전체 페이지는 등장 애니메이션을 다 돌린 뒤 캡처
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 400) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(800);
  // 스크롤 연동 등장 애니메이션은 뷰포트 기준이라, 전체 캡처 순간에만 등장 상태를 고정
  await page.addStyleTag({ content: '.reveal{animation:none!important;opacity:1!important;transform:none!important}' });
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${outDir}/${name}-full.png`, fullPage: true });
  report[name] = { viewportWidth: viewport.width, scrollWidth: scrollW, horizontalScroll: scrollW > viewport.width, errors };
  return { ctx, page };
}

const d = await shoot('desktop-1440', { width: 1440, height: 900 }, { colorScheme: 'dark' });
// 모달 캡처
await d.page.click('.card-open');
await d.page.waitForTimeout(900);
await d.page.screenshot({ path: `${outDir}/desktop-1440-modal.png` });
report['desktop-1440'].modalOpen = await d.page.evaluate(() => document.getElementById('member-modal').open);
report['desktop-1440'].focusInModal = await d.page.evaluate(() => document.getElementById('member-modal').contains(document.activeElement));
await d.page.keyboard.press('Escape');
await d.page.waitForTimeout(700);
report['desktop-1440'].modalClosedByEsc = await d.page.evaluate(() => !document.getElementById('member-modal').open);
report['desktop-1440'].focusReturned = await d.page.evaluate(() => document.activeElement?.classList.contains('card-open'));
await d.ctx.close();

const m = await shoot('mobile-390', { width: 390, height: 844 }, { isMobile: true, hasTouch: true, colorScheme: 'dark' });
await m.ctx.close();

const t = await shoot('tablet-768', { width: 768, height: 1024 }, { colorScheme: 'dark' });
await t.ctx.close();

// 라이트 모드 (시스템 설정이 밝음일 때)
const l = await shoot('desktop-1440-light', { width: 1440, height: 900 }, { colorScheme: 'light' });
await l.page.click('.card-open');
await l.page.waitForTimeout(900);
await l.page.screenshot({ path: `${outDir}/desktop-1440-light-modal.png` });
await l.page.keyboard.press('Escape');
await l.ctx.close();
const ml = await shoot('mobile-390-light', { width: 390, height: 844 }, { isMobile: true, hasTouch: true, colorScheme: 'light' });
await ml.ctx.close();

// reduced-motion 검사
const r = await shoot('desktop-reduced-motion', { width: 1440, height: 900 }, { reducedMotion: 'reduce', colorScheme: 'dark' });
report['desktop-reduced-motion'].check = await r.page.evaluate(() => {
  const ch = document.querySelector('.team-name .ch');
  const glow = document.querySelector('.glow');
  const mark = document.querySelector('.mark');
  return {
    letterAnimation: getComputedStyle(ch).animationName,
    letterOpacity: getComputedStyle(ch).opacity,
    glowDisplay: getComputedStyle(glow).display,
    underlineTransform: getComputedStyle(mark, '::after').transform,
    cueAnimation: getComputedStyle(document.querySelector('.scroll-cue-line'), '::after').display,
    statNumber: document.querySelector('.stat-num')?.textContent,
  };
});
await r.ctx.close();

await browser.close();
console.log(JSON.stringify(report, null, 2));
