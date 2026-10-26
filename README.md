# Gwin 팀 페이지

SKALA 4기 광주 2반 3조 Gwin의 팀 소개 페이지입니다.

- 주소: https://skala-gwangju-2-3.github.io/
- 검색엔진 비노출(noindex), 팀원 소개와 일정만 공개합니다.

## 무엇을 어디서 고치나요

화면 문구와 데이터는 JSON 파일 두 개에서 관리합니다. 코드를 몰라도 이 두 파일만 고치면 됩니다.

| 고칠 것 | 파일 | 필드 |
| --- | --- | --- |
| 팀명, 영문 표기, 상단 한 줄 | `config.json` | `teamName`, `teamLabel`, `subtitle` |
| 캐치프레이즈와 밑줄 단어 | `config.json` | `tagline`, `taglineHighlight` |
| 팀 이름 뜻풀이 | `config.json` | `teamNameMeaning` |
| 미션 목표 카드와 평가 항목 태그 | `config.json` | `mission.goals[].title`, `body`, `evals` |
| 수상 목표 칩 | `config.json` | `target` |
| 7주 로드맵 | `config.json` | `timeline` |
| 산출물 트래커 | `config.json` | `deliverables[].status` (`todo`, `wip`, `done`) |
| 팀 워크스페이스 | `config.json` | `workspace`, `workspacePrivate` |
| 일하는 방식 | `config.json` | `principles` |
| 팀원 정보 | `members.json` | 아래 표 참고 |

## 팀원 정보 (`members.json`)

| 필드 | 뜻 |
| --- | --- |
| `order` | 조직도 순서 (1이 PM) |
| `group` | 조직도 묶음 (예: AI · 데이터, 서비스 개발) |
| `teamRole`, `teamRoleSub` | 큰 역할 칩, 작은 세부 칩 |
| `role`, `roleAlt` | 희망 1순위, 2순위 |
| `badge` | PM 카드 위 직책 배지 |
| `keyStat`, `keyStatLabel` | 대표 수치와 설명. `6초 → 1.8초` 처럼 화살표를 쓰면 전후 값으로 표시 |
| `education`, `extraEducation`, `labs` | 학력, 추가 교육, 연구실 |
| `intro` | 한 줄 소개. 줄바꿈을 넣으면 그대로 줄이 바뀜 |
| `highlights` | 대표 경력. `**1.8초**` 처럼 감싸면 굵은 강조색 |
| `agentExp` | 상세 창 경험 요약 |
| `pledge`, `theme` | 상세 창 사진 아래 출사표와 색 (`orange`, `violet`, `teal`, `blue`, `green`) |
| `links.github`, `links.portfolio` | 상세 창 링크 |
| `photo`, `consent`, `status` | 사진 파일명(확장자 제외), 공개 동의, `ready` 또는 `pending` |

비어 있는 필드는 화면에 나오지 않습니다.

## 사진 바꾸기

1. 원본(jpg 또는 png)을 `assets/photos/` 에 넣습니다. 원본은 저장소에 올라가지 않습니다.
2. `npm run photos` 로 카드용 480px, 상세 창용 960px webp 를 만듭니다.
3. `members.json` 의 `photo` 에 확장자를 뺀 파일명을 적습니다.

## 일정이 지나면

로드맵의 "지금 여기"와 "완료" 표시, 상단 진행 단계, D-day 는 오늘 날짜로 자동 계산됩니다. 일정이 바뀌면 `timeline` 의 날짜만 고치면 됩니다.

## 배포

`main` 에 push 하면 GitHub Actions 가 1~2분 안에 배포합니다. 사이트가 끊기지 않도록 세 단계로 막습니다.

1. push 전 검사: 처음 한 번 `git config core.hooksPath .githooks` 를 실행하면, push 할 때마다 빌드와 공개 금지 문구 검사를 먼저 돌리고 실패하면 push 를 막습니다.
2. 배포 전 검사: 빌드나 검사가 실패하면 배포 단계가 돌지 않아 기존 사이트가 그대로 남습니다.
3. 배포 후 확인: 실제 주소가 200 과 `/assets/` 번들을 주는지 확인합니다.

GitHub Pages 는 새 버전이 완성된 뒤 한 번에 교체되므로 배포 중에도 이전 버전이 보입니다.

### 공개 금지 문구

공개되면 안 되는 문구 목록은 저장소에 두지 않습니다.

- 로컬 검사: `.private/forbidden.txt` (저장소 제외, 팀 내부로 공유)
- 배포 검사: 저장소 Settings → Secrets and variables → Actions 의 `FORBIDDEN_PATTERN`
- 반영 스크립트의 표현 치환: `.private/rewrite.json`

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
| `npm run photos` | 사진 webp 변환 |
| `npm run og` | 공유 미리보기 이미지 생성 |
| `npm run shots` | 데스크톱, 태블릿, 모바일, 라이트 모드 스크린샷 |

## 구조

```
config.json            팀 정보, 미션, 로드맵, 산출물, 워크스페이스, 원칙
members.json           팀원 데이터
assets/photos/         팀원 사진 (webp 만 저장소에 포함)
public/                robots.txt, 파비콘, 홈 화면 아이콘, 공유 이미지
src/main.js            렌더링과 모션
src/style.css          스타일 (다크, 라이트)
scripts/               사진 변환, 공유 이미지, 스크린샷, 팀원 정보 반영
.githooks/             push 전 검사
.github/workflows/     GitHub Pages 배포
```
