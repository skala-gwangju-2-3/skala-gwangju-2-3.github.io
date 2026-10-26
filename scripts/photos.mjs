// assets/photos/ 안의 원본(jpg, jpeg, png)을 카드용 480px, 모달용 960px webp로 변환합니다.
// 원본은 .gitignore 로 제외되고 webp 결과만 커밋됩니다.
import sharp from 'sharp';
import { readdir } from 'node:fs/promises';
import path from 'node:path';

const dir = path.resolve('assets/photos');
const files = (await readdir(dir)).filter((f) => /\.(jpe?g|png)$/i.test(f));
if (files.length === 0) {
  console.log('변환할 원본이 없습니다. assets/photos/ 에 jpg 또는 png 를 넣어 주세요.');
}
for (const file of files) {
  const base = path.parse(file).name;
  const input = path.join(dir, file);
  for (const width of [480, 960]) {
    const out = path.join(dir, `${base}-${width}.webp`);
    await sharp(input)
      .rotate()
      .resize({ width, height: Math.round((width * 4) / 3), fit: 'cover', position: 'attention' })
      .webp({ quality: 82 })
      .toFile(out);
    console.log('생성:', path.relative(process.cwd(), out));
  }
}
