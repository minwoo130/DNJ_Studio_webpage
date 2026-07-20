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

### 4.3 메인 배너 — 풀스크린 슬라이드쇼 (프론트 완료, 실사진 대기중)

`HeroBanner.tsx`: 100dvh 풀스크린 슬라이드 3장, 각 슬라이드는 가로 3분할(3장 사진) 구조 —
총 9장의 사진 슬롯. 파트①(`/seasonal` 링크) / 파트②(`/best` 링크) / 파트③(링크 없는
브랜드 무드), 슬라이드는 2초 간격 자동 전환 + 하단 점 인디케이터.

**현재 상태**: 사진 9장 전부 회색 placeholder(`PhotoSlot`, "사진 1"~"사진 9" 라벨)로만
칸을 잡아둔 상태. 실제 사진이 준비되면 `HeroBanner.tsx`의 `PhotoSlot`을 `next/image` 또는
`<img>`로 교체.

**사진 슬롯 권장 사이즈**: 각 슬롯은 화면 전체 높이(100dvh) × 화면 가로폭의 1/3을
`object-cover`로 채우는 세로로 긴 스트립 형태(모바일에서는 폭이 더 좁아짐). 아래 스펙으로
준비하면 데스크톱 와이드 화면부터 모바일 세로 화면까지 크롭해도 화질 저하가 없음:

- **권장 해상도**: **1200 × 1800px (2:3 세로 비율)**, 인물/전신 컷 기준 인물이 정중앙에
  오도록 촬영·크롭 (좌우가 잘려도 무방하게)
- **파일 형식**: JPG, 1장당 500KB 이하로 최적화 (총 9장 로딩 속도 고려)
- 9장 순서: 사진1~3 = 계절상품 파트, 사진4~6 = 베스트상품 파트, 사진7~9 = 브랜드 무드 파트

**베스트/신상품 상품 목록 연동**: `products.is_weekly_best` / `is_new_arrival` 플래그와
`GET /api/products?section=best|new` API로 완료 (8.2 참고). `/seasonal` 페이지만 아직
"준비중" placeholder — 계절상품 플래그·API는 미착수.

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
3. [완료] 상품 목록/상세/검색/카테고리/태그 브라우징 페이지 UI (모바일 우선)
4. [완료] 백엔드 API + DB 스키마 (회원/상품/장바구니/위시리스트/주문/커뮤니티/리뷰)
5. [완료] 회원 마이페이지, 관리자 페이지(품목 등록·회원관리), 커뮤니티 게시판, 리뷰 시스템
6. [보류 — 서버 이전 후 진행] 결제 모듈 연동 (계좌이체 → 카카오페이/토스페이 → PG).
   현재는 결제 없이 주문만 기록하는 간이 주문 시스템으로 대체 (8.7 참고)
7. **[진행중] 개발 마감 목표 2026-07-24** — 이후 코드를 개인 PC로 git clone해 동일한
   `docker compose` 구성으로 중랑구, 공인 IP 포트포워딩 + 도메인 연결로 정식 오픈
   (coretech 방식, [[project-coretech-deploy-pattern]]). nginx 리버스 프록시 + SSL 인증서는
   이 배포 단계에서 추가. 결제 연동은 이 서버 이전 이후 별도 진행 (9장 참고)

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
- **메인 배너**(`frontend/src/components/HeroBanner.tsx`): 풀스크린(100dvh) 슬라이드쇼,
  실제 사진 9장 대기중 (사진 스펙은 4.3 참고)
- **본문 섹션**: NOTICE는 목업 데이터 유지. **WEEKLY BEST/NEW ARRIVALS는 실제 DB에서
  `is_weekly_best`/`is_new_arrival` 플래그로 필터링해 fetch**(`ProductSection.tsx` +
  `lib/products-api.ts`, `?section=best|new`) — 3열×2행 고정 그리드로 6개 노출, 카드 클릭 시
  `/products/[id]` 상세페이지로 이동, 하단 "더보기" 버튼으로 `/best`, `/new` 전체 목록 페이지
  이동. **REAL REVIEW 섹션**은 목업을 걷어내고 실제 리뷰 DB와 연동 (8.6 참고)
- **검색**: 헤더 돋보기 클릭 시 페이지 이동 없이 상단에서 덮어지는 `SearchOverlay` 오버레이로
  검색어 입력 → 제출 시 `/search` 결과 페이지로 이동
- **위시리스트**: 하트 아이콘 클릭 시 페이지 이동 없이 `WishlistDrawer`(장바구니와 동일한
  우측 슬라이드 방식)로 즉시 확인/삭제 가능
- **헤더 카테고리 내비게이션**(`Header.tsx`): 루반트(luvant.kr) 벤치마킹해 `코디할인` 제거,
  `NEW`→`NEW 5%` 변경, `OUTER/TOP/BOTTOM/ACC`는 호버 시 서브카테고리(#해시태그) 드롭다운
  노출, `ACC` 오른쪽에 `입고지연` 메뉴 추가. 드롭다운 서브태그 목록은
  `data/products.ts`의 `CATEGORY_TAGS`(정적 내비게이션 설정, DB와 분리)에서 관리
- **해시태그/카테고리/입고지연 브라우징 페이지 신규 구현**:
  - `/tag/[tag]` — 해당 태그를 가진 상품을 DB에서 검색해 노출 (예: `/tag/입고지연`)
  - `/category/[category]` — OUTER/TOP/BOTTOM/ACC별 상품 목록 + 서브태그 칩
  - `/delayed` — `입고지연` 태그 상품 전용 안내 페이지
  - `/products/[id]` — 상품 상세페이지(이미지/가격/적립금/위시리스트·장바구니 버튼, 실 DB 연동)
- **푸터**(`frontend/src/components/Footer.tsx`): 블랙 배경의 고급스러운 톤으로 리뉴얼,
  로고+메뉴+인스타그램 한 줄 / 사업자정보+저작권 한 줄로 가로 압축 배치
- **폰트**: 본문은 Pretendard(CDN), 로고 전용으로 `next/font/google`의 Montserrat/Outfit 계열을
  실험했으나 최종적으로는 이미지 로고 사용으로 회귀하면서 로고 전용 웹폰트는 현재 비활성 상태

### 8.2 백엔드 — 회원/상품/장바구니/위시리스트
- Express + TypeScript + PostgreSQL 스캐폴딩 완료 (`backend/`)
- **DB 스키마** (`backend/database/init.sql`, 라이브 DB에도 전부 `ALTER`/`CREATE`로 반영 완료):
  - `users` — email/password_hash/name/phone/birth_date/region/**is_admin**/created_at
  - `user_coupons` — 쿠폰함(회원가입 자동 3,000원 웰컴쿠폰 + 관리자 수동 지급 쿠폰 공용)
  - `products` — name/price/original_price/badge/sold_label/category/tags TEXT[]/
    **image_url/detail_images TEXT[]/is_weekly_best/is_new_arrival**
  - `cart_items`, `wishlist_items` — user_id+product_id UNIQUE
  - `orders`/`order_items` — 간이 주문 기록 (8.7 참고)
  - `community_posts`/`community_comments` — 커뮤니티 게시판 (8.5 참고)
- **인증 미들웨어** (`middleware/auth.ts`): `requireAuth`(JWT 필수), `optionalAuth`(있으면
  파싱, 없어도 통과 — 비로그인 조회 허용용), `requireAdmin`(JWT + `users.is_admin` 확인).
  기존 `x-admin-key` 공유비밀키 방식(`adminAuth.ts`)은 쿠폰 수동지급 엔드포인트에만 잔존
- **인증/회원 API** (`routes/auth.ts`): signup(생년월일·배송지역 필수, 웰컴쿠폰 자동지급),
  login(JWT + isAdmin), `GET /me`(내 정보 + 쿠폰)
- **상품 API** (`routes/products.ts`): `GET /api/products`(category/tag/q/**section=best|new**
  필터), `GET /:id`, **`POST/PUT/DELETE`는 `requireAuth`+`requireAdmin`으로 보호 완료**.
  `POST /upload`(관리자 전용, `multer`로 `backend/uploads/products/`에 저장) — 대표이미지 1장 +
  상세페이지 이미지 여러 장(`detailImages`, 관리자 페이지에서 드래그로 순서 변경 가능)
- **장바구니/위시리스트 API**: 기존과 동일, 응답에 `imageUrl` 포함하도록 보강
- **관리자 회원 API** (`routes/admin.ts`): `GET /api/admin/users`(JWT 관리자 인증) — 전 회원
  목록(비밀번호 해시 제외) 반환. 쿠폰 수동지급 엔드포인트는 기존 `x-admin-key` 방식 유지

### 8.3 프론트엔드 — 회원/마이페이지
- `/login`, `/signup` — 성공 시 JWT+user를 `localStorage`에 저장 후 메인 리다이렉트.
  로그인 아이디 입력란은 `type="text"`(관리자 계정처럼 실제 이메일이 아닌 로그인ID 허용)
- `/mypage` — 인사말, 통계 타일(장바구니/위시리스트/보유쿠폰/**주문내역 실건수**),
  **장바구니**(수량 +/-, 삭제, 총액, **"주문하기" 버튼 실제 동작**), **위시리스트**,
  **보유 쿠폰**, **회원정보**, **주문내역**(실제 주문건 + 상품 목록 표시), 로그아웃
- `/search` — 헤더 검색 오버레이에서 제출 시 이동, `GET /api/products?q=`로 조회
- 상품 카드/상세페이지의 위시리스트·장바구니 버튼 실제 API 연동, 비로그인 시 `/login`으로 이동
- **알려진 한계 (미해결)**: 로그인 상태 전역 관리 부재 — 각 컴포넌트가 개별적으로
  `localStorage`를 체크해서 새로고침 전엔 헤더가 즉시 갱신 안 될 수 있음

### 8.4 저장소
- 독립 git 저장소로 초기화 후 GitHub 연결·push 완료:
  `https://github.com/minwoo130/DNJ_Studio_webpage` (`main` 브랜치)
- `.env`는 git 제외 상태 유지 (`.env.example`만 커밋됨). `backend/uploads/`(상품·리뷰 업로드
  파일)는 `.gitkeep`만 커밋되고 실제 업로드 파일은 `.gitignore` 처리

### 8.5 커뮤니티 게시판 (신규)
- 헤더 "입고지연" 오른쪽에 `Community` 드롭다운(Notice/Review/QnA/반품·교환) 추가
- `routes/community.ts`: 게시판별 목록(`GET /:boardType`, productId 필터·페이지네이션)/
  상세(`GET /:boardType/:id`)/작성/수정/삭제, 댓글 작성/삭제 API
  - **Notice**: 관리자만 작성 가능, 회원은 읽기만
  - **비밀글**: 작성 시 비밀번호 필수 입력(bcrypt 저장). 작성자·관리자는 자동 열람,
    그 외에는 상세페이지에서 비밀번호 입력 후 `POST /:boardType/:id/unlock`으로 열람
  - **사진 첨부**: 모든 게시판 타입에서 사진 최대 5장 첨부 가능(`image_urls TEXT[]`,
    `POST /api/community/upload`로 개별 업로드 후 URL 배열로 저장)
  - **작성자 이름 마스킹**: 목록/상세/댓글에 노출되는 작성자 이름은 두번째 글자만 `*`
    처리(예: 김민수 → 김\*수, 남궁민수 → 남\*민수). **관리자 계정은 마스킹 예외**로 실명 노출
- 프론트: `/community/[type]`(목록, 탭 전환, 비밀글 자물쇠 아이콘), `/community/[type]/[id]`
  (상세, 댓글, 비밀글 비밀번호 입력폼, 첨부사진 라이트박스), `/community/[type]/write`,
  `/community/[type]/[id]/edit` — 공용 `MultiImageUpload` 컴포넌트로 사진 첨부 UI 재사용

### 8.6 리뷰 시스템 (신규)
- 커뮤니티 Review 게시판 = 상품 리뷰 데이터를 공유 (`product_id`, `rating` 1~5 컬럼 추가)
- **구매 인증**: 해당 상품을 구매한 회원 또는 관리자만 리뷰 작성 가능
  (`GET /api/orders/purchased/:productId`로 사전 체크, 미구매 시 안내 문구만 노출)
- 상품 상세페이지(`ProductReviews.tsx`) 하단에 별점 선택 + 사진(최대 5장) 첨부 리뷰
  작성폼과 해당 상품 리뷰 목록(사진 클릭 시 라이트박스 확대) 표시
- 메인페이지 **REAL REVIEW**(`RealReview.tsx`): 세로 리스트가 아닌 **가로 스크롤 카드**로
  전체 최신 리뷰를 20초 간격 폴링해서 자동 갱신 (사진/별점/상품명/작성자·날짜)

### 8.7 주문 시스템 — 결제 미포함 간이 버전 (신규)
- `orders`/`order_items` 테이블: 장바구니 "주문하기" 클릭 시 **결제 없이** 주문 레코드만
  생성하고 장바구니를 비움 (`POST /api/orders`)
- `GET /api/orders` — 내 주문내역(상품/수량/가격) 조회, 마이페이지에 반영
- `GET /api/orders/purchased/:productId` — 리뷰 작성 권한 체크용
- **결제(계좌이체/카카오페이/토스페이/PG) 연동은 서버 이전 이후 진행 예정** — 지금은
  주문=결제완료로 간주하는 임시 상태. 실 운영 전 반드시 결제 확인 로직 추가 필요 (9장 참고)

### 8.8 관리자 페이지 고도화 (신규)
- 탭 이름 "재고관리" → **"품목 등록"**으로 변경
- **품목 등록**(`AdminInventory.tsx`): 상품 등록/수정/삭제, 대표이미지 업로드, **상세페이지
  이미지 여러 장 업로드**(드래그&드롭으로 순서 변경 가능), **WEEKLY BEST/NEW ARRIVALS**
  노출 체크박스
- **회원관리**(`AdminMembers.tsx`): 전 회원 목록(이메일/이름/전화/지역/가입일/권한) 조회 +
  이메일·이름 검색
- **판매관리**(`AdminOrders.tsx`, 신규): 전체 주문 목록 + 회원정보(비회원 대비 guest 필드도
  스키마상 준비됨) + 배송지정보 + 상품 목록 표시, **택배배송 완료 체크박스**로 배송상태 토글
  (`GET/PATCH /api/admin/orders`)

### 8.9 체크아웃/배송지 시스템 (신규)
- `users` 테이블에 **기본 배송지**(zip_code/address/address_detail) 컬럼 추가 — 회원가입 시
  주소 필수 입력, 마이페이지 회원정보에서 추후 수정 가능하도록 설계
- `orders` 테이블에 **배송지 정보**(수령인명/연락처/우편번호/주소/상세주소/요청사항)와
  **배송상태**(`is_shipped`, `shipped_at`) 컬럼 추가. `user_id`는 **nullable로 변경**해
  향후 비회원 주문(guest_name/phone/email 컬럼도 미리 추가)을 받을 수 있도록 스키마만 대비 —
  실제 비회원 체크아웃 플로우는 다음 단계 작업
- **`/checkout` 페이지 신설**: 장바구니 요약 + 배송지 입력폼. 회원이 저장된 기본 배송지가 있으면
  "기본 배송지 사용" / "직접 입력" 라디오로 선택 가능. 주문 진행 동의 체크박스(필수) 통과해야
  주문 제출 가능. 마이페이지 "주문하기" 버튼이 이 페이지로 이동하도록 변경

### 8.10 약관/정책 페이지 및 동의 절차 (신규)
- `/policy/terms`(이용약관), `/policy/privacy`(개인정보처리방침), `/policy/shipping`(배송정책),
  `/policy/returns`(교환/반품정책), `/policy/refund`(환불정책) 정적 페이지 신설, 푸터에 링크 연결.
  **실제 사업자 정보(대표자/사업장주소/사업자등록번호/이메일)는 반영했으나, 통신판매업 신고번호
  등은 아직 없어 예시 템플릿 상태 — 실 운영 전 법률 검토 후 확정 필요**
- **회원가입 동의 체크박스**: 전체동의 / 이용약관[필수] / 개인정보 수집·이용[필수] /
  만 14세 이상[필수] / 마케팅 수신[선택] — 필수 항목 미동의 시 가입 자체가 막힘
- **체크아웃 동의 체크박스**: 주문 진행 시 배송정보 제3자(택배사) 제공 동의(필수) 통과해야
  주문 제출 가능. 비회원 구매 도입 시에도 동일 구조 재사용 예정

## 9. 오픈 일정 및 배포 계획

- **개발 마감 목표**: **2026-07-24**. 그 전까지는 아래 "오픈 전 남은 작업"을 이 로컬
  Docker 개발 환경에서 계속 진행
- **배포 방식** (coretech 프로젝트와 동일한 방식, [[project-coretech-deploy-pattern]]):
  1. 개발 마감 후 이 저장소를 **개인 PC**로 git clone
  2. 같은 `docker-compose.yml`을 운영 값으로 편집(볼륨 마운트 제거, `npm run build && start`
     전환) 후 nginx 컨테이너 추가
  3. 공유기 포트포워딩으로 **공인 IP** 연결, 도메인 연결 + SSL 인증서 적용해 정식 오픈
  4. dev/prod compose 파일을 분리하지 않고 하나를 상황에 맞게 편집하는 방식 그대로 유지
- **결제(계좌이체/카카오페이/토스페이/PG) 연동은 서버 이전 이후 별도로 진행**. 그 전까지는
  8.7의 간이 주문 시스템(결제 없이 주문만 기록)으로 운영

### 9.1 오픈 전 남은 작업 (결제 제외, 개발 마감일 2026-07-24 전까지)

- [x] ~~관리자 주문 관리 화면~~ — 8.8 "판매관리" 탭으로 완료
- [x] ~~회원가입 시 배송지 입력~~ — 8.9로 완료
- [x] ~~약관/정책 페이지 + 가입·주문 동의 절차~~ — 8.10으로 완료
- [ ] **비회원(게스트) 체크아웃 플로우** — DB 스키마(guest_name/phone/email, user_id nullable)는
  준비됐지만 실제 "비회원 바로구매" 플로우는 미착수
- [ ] **메인 배너 실사진 9장** 촬영/준비 후 `HeroBanner.tsx`에 적용 (권장 사이즈는 4.3 참고)
- [ ] **실제 상품 사진/상품 데이터**로 더미 상품(현재 `init.sql` 시드 데이터) 교체 —
  관리자 "품목 등록"에서 실제 상품을 하나씩 등록
- [ ] **로그인 상태 전역 관리** — 새로고침 없이 헤더 등에 로그인 상태가 즉시 반영되도록
  Context 등 전역 상태 도입 검토 (8.3 알려진 한계)
- [ ] **일반 회원용 비밀번호 재설정 플로우** — 현재는 관리자 계정 비밀번호를 개발자가 DB에서
  직접 리셋하는 방식뿐, 일반 회원용 "비밀번호 찾기" 기능 없음
- [ ] **/seasonal 페이지** 실제 상품 연동 (계절상품 플래그/API 미착수, 4.3 참고)
- [ ] **약관/정책 페이지 실제 법률 검토** — 현재 내용은 예시 템플릿(통신판매업 신고번호 등 미기재),
  실 운영 전 사업 형태에 맞게 확정 필요
- [ ] **운영용 `.env` 값 재발급** — `JWT_SECRET`/`ADMIN_API_KEY`/DB 비밀번호 등을 개발용
  값 그대로 쓰지 말고 서버 이전 시 새로 발급
- [ ] 사업자정보(통신판매업 신고 등)·결제 관련 사전 준비는 [[project-dnjstudio-payment-plan]]
  메모 참고 — 서버 이전 이후 결제 연동과 함께 진행
