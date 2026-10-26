# 광주 2반 3조 팀 소개 페이지

SKALA 4기 광주 2반 3조의 팀 소개 페이지입니다.
배포 주소: https://skala-gwangju-2-3.github.io/

## 팀원 추가 방법

1. `members.json` 에서 본인 항목을 채우고 `status` 를 `"ready"`, `consent` 를 `true` 로 바꿉니다.
2. 사진 원본(jpg 또는 png)을 `assets/photos/` 에 넣고 `npm run photos` 를 실행합니다.
   카드용 480px와 모달용 960px webp가 같은 폴더에 생깁니다. 원본은 커밋되지 않습니다.
   `photo` 필드에는 확장자를 뺀 파일명을 적습니다. 예: `jang.jpg` 를 넣었으면 `"photo": "jang"`.
3. `main` 에 push 하면 GitHub Actions가 자동으로 배포합니다.

비어 있는 필드는 화면에 표시되지 않습니다. `consent` 가 `false` 이면 사진 대신 이니셜 아바타가 나옵니다.

## 팀명 바꾸기

`config.json` 의 `teamName` 만 바꾸면 됩니다. 글자 수에 맞춰 히어로 글자 크기가 자동으로 조절됩니다.
영문명, 태그라인, 일하는 방식, 푸터 문구도 같은 파일에서 관리합니다.

## 로컬 실행

```bash
npm install
npm run dev
```

| 명령 | 역할 |
| --- | --- |
| `npm run dev` | 개발 서버 |
| `npm run build` | `dist/` 에 정적 파일 생성 |
| `npm run preview` | 빌드 결과 미리보기 (4173 포트) |
| `npm run photos` | `assets/photos/` 원본을 webp로 변환 |
| `npm run og` | `config.json` 으로 공유 미리보기 이미지 생성 |
| `npm run shots` | Playwright로 데스크톱과 모바일 스크린샷, reduced-motion 검사 |

## 구조

```
config.json              팀 정보 (팀명, 태그라인, 일하는 방식, 푸터)
members.json             팀원 데이터
assets/photos/           팀원 사진 (webp만 커밋)
public/                  robots.txt, favicon.svg, og.png
src/main.js              렌더링과 모션
src/style.css            스타일
scripts/                 사진 변환, OG 생성, 스크린샷
.github/workflows/       GitHub Pages 배포
```
