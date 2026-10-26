import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';

// config.json 의 팀 정보를 빌드 때 index.html 에 미리 넣어 첫 화면부터 글자가 보이게 합니다.
// (JS 가 실행된 뒤 같은 값으로 다시 그리므로 관리 원본은 config.json 하나입니다)
function injectConfig() {
  const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const titleWidth = (name) => {
    const words = name.trim().split(/\s+/);
    let w = 0;
    for (const word of words) for (const ch of [...word]) w += /[ᄀ-ᇿ㄰-㆏가-힯぀-ヿ一-鿿]/.test(ch) ? 1 : 0.62;
    return Math.max(1, (w + (words.length - 1) * 0.22) * 0.97).toFixed(2);
  };
  return {
    name: 'inject-config',
    transformIndexHtml(html) {
      const c = JSON.parse(readFileSync('config.json', 'utf8'));
      return html
        .replaceAll('%TEAM_NAME%', esc(c.teamName))
        .replaceAll('%TEAM_NAME_EN%', esc(c.teamNameEn))
        .replaceAll('%SUBTITLE%', esc(c.subtitle))
        .replaceAll('%TAGLINE%', esc(c.tagline))
        .replaceAll('%FOOTER%', esc(c.footer))
        .replaceAll('%TITLE_W%', titleWidth(c.teamName));
    },
  };
}

export default defineConfig({
  base: '/',
  plugins: [injectConfig()],
  build: { target: 'es2022', assetsInlineLimit: 0 },
});
