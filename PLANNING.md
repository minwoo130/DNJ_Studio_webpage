# dnjstudio — 의류 쇼핑몰 프로젝트 기획서

> 스타트업 초기 단계 의류 쇼핑몰. 로컬은 Docker로 개발하고, 추후 nginx 리버스 프록시 +
> 도메인 연결로 운영 서버를 띄운다 (이전 coretech 프로젝트와 동일한 구동 방식).

## 1. 프로젝트 개요

- **프로젝트명**: dnjstudio
- **종류**: 의류 쇼핑몰 (커머스)
- **개발 우선순위**: **모바일 환경 우선 (Mobile-First)**. 데스크톱은 반응형으로 대응하되,
  실제 UX/QA는 모바일 뷰포트 기준으로 진행한다.
- **경쟁사 벤치마킹**: [luvant.kr](https://luvant.kr/) — 캐주얼/미니멀 톤의 패션 쇼핑몰.
  디자인 방향과 카테고리 구조를 아래 3번 항목에서 참고한다.

## 2. 구동 방식 (Docker → nginx, coretech 방식과 동일)

| 단계 | 구성 |
|---|---|
| 로컬 개발 | `docker-compose.yml` 로 frontend/backend/db 컨테이너 실행. 소스는 볼륨 마운트해서 핫리로드. 현재 단계에서는 프론트만 우선 `localhost:30001` 로 노출해서 눈으로 확인하며 개발. |
| 운영 배포 | 같은 `docker-compose.yml`을 프로덕션 값으로 수정(볼륨 마운트 제거, `npm run build && start`로 전환) 후 nginx 컨테이너 추가, 도메인 연결 + SSL 인증서 적용. dev/prod compose 파일을 분리하지 않고 하나를 상황에 맞게 편집하는 방식을 그대로 따른다. |

- dev 단계 포트: **frontend → `localhost:30001`**
- 추후 nginx 붙이면 80/443을 nginx가 받고, frontend/backend는 내부 네트워크로만 통신 (coretech와 동일 패턴).

## 3. 디자인 가이드 (luvant.kr 벤치마킹)

- **톤앤매너**: 미니멀 + 캐주얼. 화이트 배경 위주, 여백을 넉넉히.
- **색상**
  - 배경: `#FFFFFF`
  - 텍스트: 다크 그레이 / 블랙 계열
  - 포인트(할인가): 레드
  - 신상품 배지: 오렌지
  - 링크/강조: 블루 계열
- **타이포그래피**: 산세리프 중심. 제목은 굵게(bold), 본문은 레귤러. 상품명·가격은
  시각적 위계가 뚜렷하게 (가격 > 상품명 > 설명).
- **레이아웃**: 상단 로고+통합 내비게이션 → 메인 배너 → 상품 그리드(모바일 2열 / 데스크톱 3~4열)
  → 하단 푸터.
- **UI 요소**: 위시리스트 하트 아이콘, 할인/NEW/1+1 배지, 누적 판매량 노출, 빠른배송 표시 등
  전환을 유도하는 소셜프루프 요소를 적극 활용.
- **카테고리 예시**: OUTER / TOP / BOTTOM / ACC 기본 분류 + "당일출발", "코디할인" 같은
  기획전/할인 중심 카테고리 병행 운영.

## 4. 핵심 기능

### 4.1 상품/쇼핑 기본 기능
- 상품 목록/상세, 카테고리 필터, 검색
- 장바구니, 위시리스트
- 회원가입/로그인 (일반 + 추후 소셜 로그인 고려)
- 주문/배송 조회, 마이페이지
- 관리자(어드민) 페이지 — 상품/주문/재고 관리

### 4.2 결제 기능 (최우선 기능)
가장 중요한 기능. 아래 4가지 결제 수단을 모두 지원해야 함.

1. **무통장입금 (계좌이체)**
   - 사업자 명의 **기업은행 계좌**로 입금받는 방식
   - 입금자명/입금확인 프로세스 필요 (관리자 수동 확인 또는 자동 매칭 API 검토)
2. **카카오페이**
3. **토스페이**
4. **PG(전자결제) 연동** — 신용카드 등 결제 시 **은행사/결제사를 사용자가 선택**할 수 있어야 함
   - 국내 PG사 후보: 토스페이먼츠 / KG이니시스 / 나이스페이먼츠 등에서 스타트업 초기 수수료·연동
     난이도 비교 후 선정 필요 (별도 논의)
   - 카카오페이·토스페이도 PG사를 통해 한 번에 연동 가능한 경우가 많아 PG사 선정이 우선순위

> 결제 모듈은 프론트(결제 UI/수단 선택) - 백엔드(결제 요청/검증/웹훅 처리) - PG사 API 3단 구조로 설계.
> 결제 금액/상태는 반드시 서버(백엔드)에서 최종 검증 후 주문 상태를 변경한다 (클라이언트 신뢰 금지).

### 4.3 메인 배너 — 계절상품 / 베스트 상품 (프론트 완료, 백엔드 예정)

메인페이지 헤더 바로 아래 배너를 2분할 이미지로 구성. 각 이미지를 클릭하면 카테고리
랜딩 페이지로 이동한다.

- `/seasonal` (계절상품) — 시즌/신상품 모음
- `/best` (베스트 상품) — 누적 판매량 기준 인기상품 모음

**현재 상태**: 프론트엔드 라우트(`frontend/src/app/seasonal/page.tsx`,
`frontend/src/app/best/page.tsx`)와 배너 클릭 이동만 구현됨. 두 페이지 모두 실제 상품
목록 없이 "준비중" placeholder만 표시 중.

**백엔드 구현 예정 사항 (미착수)**:
- `products` 테이블에 `season`(예: `2026_summer`), `is_best`(boolean) 또는 `tags` 컬럼 추가해
  계절상품/베스트상품을 필터링할 수 있게 스키마 설계
- API: `GET /api/products?section=seasonal`, `GET /api/products?section=best` (또는
  `/api/products/seasonal`, `/api/products/best` 형태의 전용 엔드포인트) — 페이지네이션 포함
- 베스트 상품 기준(판매량 집계 방식: 실시간 집계 vs 배치 집계)은 주문/결제 기능 구현 이후 확정
- 프론트 `/seasonal`, `/best` 페이지에서 위 API를 호출해 상품 그리드로 교체

## 5. 기술 스택 (초안 — coretech 경험 기반)

- **프론트엔드**: Next.js (App Router, TypeScript) + Tailwind CSS — 모바일 퍼스트 반응형
- **백엔드**: Express + TypeScript
- **DB**: PostgreSQL
- **리버스 프록시**: nginx:alpine (운영 단계에서 추가)
- **컨테이너**: Docker / Docker Compose

## 6. 디렉토리 구조 (예정)

```
dnjstudio/
├── PLANNING.md
├── docker-compose.yml
├── .env                  # git 제외
├── .gitignore
├── nginx/
│   └── nginx.conf        # 운영 단계에서 추가
├── frontend/              # Next.js
│   ├── Dockerfile
│   └── src/app/...
└── backend/                # Express + TypeScript
    ├── Dockerfile
    └── src/
        ├── app.ts
        ├── routes/
        │   ├── payments.ts   # 계좌이체/카카오페이/토스페이/PG 처리
        │   └── ...
        └── database/
```

## 7. 진행 순서 (로드맵)

1. [완료] 기획 문서 작성, 디렉토리 구조 확정
2. [완료] 프론트엔드 스캐폴딩 → `localhost:30001` 에서 정적 페이지 확인
3. [진행중] 상품 목록/상세 등 기본 페이지 UI 구현 (모바일 우선) — 메인 페이지 UI는 완료,
   `/seasonal`, `/best` 등 목록 페이지는 placeholder만 있는 상태
4. [부분 완료] 백엔드 API + DB 스키마 설계 (상품/회원/주문) — 회원가입/로그인만 구현, 상품/주문은 미착수
5. 결제 모듈 연동 (계좌이체 → 카카오페이/토스페이 → PG)
6. 관리자 페이지
7. nginx + 도메인 + SSL 연결해 운영 서버 배포 (coretech 방식)

## 8. 현재까지 진행 상황 (최신 스냅샷)

### 8.1 프론트엔드 (거의 완료 — 메인 페이지 기준)
- **로컬 구동**: Docker Compose로 frontend(`localhost:30001`) / backend(`localhost:30002`) /
  postgres(`localhost:30003`) 3개 컨테이너 기동 중. `sudo docker compose up -d --build`로 재기동.
- **헤더**(`frontend/src/components/Header.tsx`)
  - 로고는 화면 맨 왼쪽 고정 배치, 카테고리 8종은 로고 옆(데스크톱) / 햄버거 드로어(모바일)
  - 메인 페이지 한정으로 최상단에서 **투명 헤더 → 스크롤 시 흰 배경으로 전환**되는 오버레이 효과
    (`<Header overlay />` prop) 적용, 다른 페이지는 항상 불투명
  - 검색/위시리스트/장바구니(뱃지)/마이페이지 아이콘을 텍스트 대신 SVG 아이콘으로 교체
- **로고**: 실제 브랜드 이미지 파일(`frontend/public/logo.png`, 알파 투명 처리된 "DNJ STUDIO" 마크)
  사용. 헤더/모바일드로어/푸터 공통 적용. (중간에 텍스트 폰트 로고로 실험했다가 다시 이미지로 원복)
- **파비콘**: 사용자 제공 `파비콘.png`(DNJ 마크) 기반으로 16/32/48/apple-touch/android-chrome/
  favicon.ico 전체 세트 생성해 `frontend/src/app/layout.tsx` metadata에 연결 완료
- **메인 배너**: 헤더 바로 아래 2분할 클릭형 이미지 배너 — 왼쪽 "계절상품"(`/seasonal`),
  오른쪽 "베스트 상품"(`/best`) 링크. 사진은 남성복 컨셉의 스톡 이미지로 교체 완료(임시,
  추후 실제 화보/AI 생성 이미지로 교체 필요)
- **본문 섹션**: NOTICE, WEEKLY BEST, NEW ARRIVALS(더보기 페이지네이션 표기), REAL REVIEW
  전부 목업 데이터로 구현됨 (`frontend/src/app/page.tsx`)
- **푸터**(`frontend/src/components/Footer.tsx`): 블랙 배경의 고급스러운 톤으로 리뉴얼,
  로고+메뉴+인스타그램 한 줄 / 사업자정보+저작권 한 줄로 가로 압축 배치
- **폰트**: 본문은 Pretendard(CDN), 로고 전용으로 `next/font/google`의 Montserrat/Outfit 계열을
  실험했으나 최종적으로는 이미지 로고 사용으로 회귀하면서 로고 전용 웹폰트는 현재 비활성 상태

### 8.2 백엔드 (일부 구현)
- Express + TypeScript + PostgreSQL 스캐폴딩 완료 (`backend/`)
- DB 스키마: `users`, `user_coupons` 테이블 (`backend/database/init.sql`)
- **구현 완료 & 테스트 통과**:
  - `POST /api/auth/signup` — 회원가입 시 **3,000원 웰컴 쿠폰 자동 지급**(90일 유효), JWT 발급
  - `POST /api/auth/login` — 로그인, JWT 발급
  - 중복 이메일 가입 시 409 처리 확인
- **미구현** (다음 세션에서 이어서 작업 예정):
  - 상품(`products`) 테이블 및 CRUD API
  - `/seasonal`, `/best` 상품 목록 API (4.3 항목 참고)
  - 장바구니, 주문, 결제(계좌이체/카카오페이/토스페이/PG) 전부 미착수
  - 관리자 API

### 8.3 저장소
- 독립 git 저장소로 초기화 후 GitHub 연결·push 완료:
  `https://github.com/minwoo130/DNJ_Studio_webpage` (`main` 브랜치)
- `.env`는 git 제외 상태 유지 (`.env.example`만 커밋됨)
