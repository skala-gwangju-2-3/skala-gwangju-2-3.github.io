// 공유 미리보기용 OG 이미지(1200x630). 사진 없이 팀명과 태그라인만 넣습니다.
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';

const config = JSON.parse(await readFile('config.json', 'utf8'));
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const len = Math.max(1, [...config.teamName].length);
const titleSize = Math.min(200, Math.floor(1040 / len * 1.05));
const font = `'Pretendard Variable', Pretendard, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="#0E1726"/>
  <circle cx="1040" cy="120" r="320" fill="#F2994A" fill-opacity="0.10"/>
  <text x="80" y="120" font-family="${font}" font-size="30" font-weight="600" fill="#A9B4C8" letter-spacing="2">${esc(config.subtitle)}</text>
  <text x="76" y="${150 + titleSize}" font-family="${font}" font-size="${titleSize}" font-weight="800" fill="#F3F5F9" letter-spacing="${-titleSize * 0.04}">${esc(config.teamName)}</text>
  <text x="80" y="${200 + titleSize + 50}" font-family="${font}" font-size="34" font-weight="500" fill="#A9B4C8">${esc(config.teamNameEn)}</text>
  <text x="80" y="560" font-family="${font}" font-size="40" font-weight="600" fill="#F3F5F9">${esc(config.tagline)}</text>
  <rect x="80" y="578" width="96" height="6" fill="#F2994A"/>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile('public/og.png');
console.log('생성: public/og.png');
