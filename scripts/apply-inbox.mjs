// ~/Desktop/skala-team-inbox/ 의 members_update.json 과 photos/ 를 members.json 과 assets/photos/ 에 반영합니다.
// 사용법: node scripts/apply-inbox.mjs [인박스 경로]
import { readFile, writeFile, readdir, copyFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

const inbox = process.argv[2] || path.join(os.homedir(), 'Desktop', 'skala-team-inbox');
const INTERNAL = new Set(['note']); // 화면에 쓰지 않는 운영용 필드
// 공개 페이지용 표현 치환 목록은 저장소에 올리지 않는 .private/rewrite.json 에 둔다
let REWRITE = [];
try {
  REWRITE = JSON.parse(await readFile('.private/rewrite.json', 'utf8'));
} catch {
  console.log('참고: .private/rewrite.json 없음, 표현 치환 없이 반영합니다.');
}
const rewrite = (v) => {
  if (typeof v === 'string') return REWRITE.reduce((acc, [a, b]) => acc.split(a).join(b), v);
  if (Array.isArray(v)) return v.map(rewrite);
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, rewrite(x)]));
  return v;
};
const members = JSON.parse(await readFile('members.json', 'utf8'));
const updates = JSON.parse(await readFile(path.join(inbox, 'members_update.json'), 'utf8'));
const photos = await readdir(path.join(inbox, 'photos')).catch(() => []);
const changed = [];

for (const u of updates) {
  const idx = members.findIndex((m) => m.id === u.id || m.name === u.name);
  if (idx < 0) {
    console.log(`건너뜀: members.json 에 없는 팀원 ${u.name} (${u.id})`);
    continue;
  }
  const clean = rewrite(Object.fromEntries(Object.entries(u).filter(([k]) => !INTERNAL.has(k))));
  // 사진: photos/ 에 같은 이름의 파일이 있으면 복사하고 photo 필드는 확장자 없는 이름으로
  if (clean.photo) {
    const file = photos.find((f) => f === clean.photo || path.parse(f).name === path.parse(clean.photo).name);
    if (file) {
      await copyFile(path.join(inbox, 'photos', file), path.join('assets/photos', file));
      console.log(`사진 복사: ${file}`);
    }
    clean.photo = path.parse(clean.photo).name;
  }
  const before = JSON.stringify(members[idx]);
  members[idx] = { ...members[idx], ...clean, id: members[idx].id };
  if (before !== JSON.stringify(members[idx])) changed.push(members[idx].name);
}
await writeFile('members.json', JSON.stringify(members, null, 2) + '\n');
console.log(changed.length ? `갱신: ${changed.join(', ')}` : '바뀐 항목 없음');
