CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name          VARCHAR(100) NOT NULL,
  phone         VARCHAR(20),
  birth_date    DATE,
  region        VARCHAR(50),
  zip_code      VARCHAR(10),
  address       VARCHAR(255),
  address_detail VARCHAR(255),
  is_admin      BOOLEAN NOT NULL DEFAULT false,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_coupons (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount      INTEGER NOT NULL,
  reason      VARCHAR(100) NOT NULL,
  is_used     BOOLEAN NOT NULL DEFAULT false,
  issued_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  used_at     TIMESTAMPTZ,
  expires_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_user_coupons_user_id ON user_coupons(user_id);

CREATE TABLE IF NOT EXISTS products (
  id             SERIAL PRIMARY KEY,
  name           VARCHAR(200) NOT NULL,
  price          INTEGER NOT NULL,
  original_price INTEGER,
  badge          VARCHAR(20),
  sold_label     VARCHAR(100),
  category       VARCHAR(20) NOT NULL,
  tags           TEXT[] NOT NULL DEFAULT '{}',
  image_url      VARCHAR(500),
  image_urls     TEXT[] NOT NULL DEFAULT '{}',
  detail_content TEXT NOT NULL DEFAULT '',
  detail_images  TEXT[] NOT NULL DEFAULT '{}',
  is_weekly_best BOOLEAN NOT NULL DEFAULT false,
  is_new_arrival BOOLEAN NOT NULL DEFAULT false,
  best_order     INTEGER CHECK (best_order IS NULL OR best_order BETWEEN 1 AND 6),
  new_order      INTEGER CHECK (new_order IS NULL OR new_order BETWEEN 1 AND 6),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING GIN(tags);
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_best_order_uniq ON products(best_order) WHERE best_order IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_new_order_uniq ON products(new_order) WHERE new_order IS NOT NULL;

INSERT INTO products (id, name, price, original_price, badge, sold_label, category, tags) VALUES
  (1, '오버핏 울 코트', 89000, NULL, '추천', '누적 1,200장', 'OUTER', ARRAY['코트','울코트','오버핏']),
  (2, '크롭 니트 가디건', 39000, 52000, 'SALE', NULL, 'OUTER', ARRAY['가디건','니트','입고지연']),
  (3, '와이드 슬랙스', 35000, NULL, NULL, '누적 3,000장', 'BOTTOM', ARRAY['슬랙스','와이드팬츠','당일출발']),
  (4, '베이직 반팔 티셔츠', 19000, NULL, '1+1', NULL, 'TOP', ARRAY['티셔츠','베이직','당일출발']),
  (5, '미니멀 크로스백', 45000, NULL, NULL, NULL, 'ACC', ARRAY['가방','크로스백']),
  (6, '체크 머플러', 22000, NULL, 'NEW', NULL, 'ACC', ARRAY['머플러','목도리','입고지연'])
ON CONFLICT (id) DO NOTHING;

SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));

CREATE TABLE IF NOT EXISTS cart_items (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity    INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);

CREATE TABLE IF NOT EXISTS wishlist_items (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlist_items_user_id ON wishlist_items(user_id);

-- 실제 결제 연동 전까지 쓰는 간이 주문 기록 (장바구니 "주문하기" -> 결제 없이 주문 완료 처리, 구매 리뷰 검증에 사용)
CREATE TABLE IF NOT EXISTS orders (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER REFERENCES users(id) ON DELETE CASCADE,
  guest_name      VARCHAR(100),
  guest_phone     VARCHAR(20),
  guest_email     VARCHAR(255),
  status          VARCHAR(20) NOT NULL DEFAULT 'placed',
  total_amount    INTEGER NOT NULL,
  recipient_name  VARCHAR(100) NOT NULL,
  recipient_phone VARCHAR(20) NOT NULL,
  zip_code        VARCHAR(10),
  address         VARCHAR(255) NOT NULL,
  address_detail  VARCHAR(255),
  memo            VARCHAR(255),
  is_shipped      BOOLEAN NOT NULL DEFAULT false,
  shipped_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- 무통장입금 결제 필드 (기존 backup.sql 복원 시에도 안전하게 재실행 가능하도록 ALTER로 작성)
-- orders.status: placed(기본, 주문접수) -> preparing(입금확인 후 상품준비중) -> cancelled(주문취소)
-- orders.payment_method: BANK_TRANSFER(구현됨) / 예약: TOSS_PAY, KAKAO_PAY, CARD
-- orders.payment_status: WAITING(기본, 입금대기) -> PAID(입금완료) / CANCELLED(취소)
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_method   VARCHAR(20)  NOT NULL DEFAULT 'BANK_TRANSFER',
  ADD COLUMN IF NOT EXISTS payment_status   VARCHAR(20)  NOT NULL DEFAULT 'WAITING',
  ADD COLUMN IF NOT EXISTS depositor_name   VARCHAR(100),
  ADD COLUMN IF NOT EXISTS deposit_deadline TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS paid_at          TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS order_items (
  id          SERIAL PRIMARY KEY,
  order_id    INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity    INTEGER NOT NULL,
  price       INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

CREATE TABLE IF NOT EXISTS notifications (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id    INTEGER REFERENCES orders(id) ON DELETE SET NULL,
  message     TEXT NOT NULL,
  is_read     BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id, id DESC);

CREATE TABLE IF NOT EXISTS community_posts (
  id          SERIAL PRIMARY KEY,
  board_type  VARCHAR(20) NOT NULL CHECK (board_type IN ('notice', 'review', 'qna', 'exchange')),
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       VARCHAR(200) NOT NULL,
  content     TEXT NOT NULL,
  is_private  BOOLEAN NOT NULL DEFAULT false,
  view_count  INTEGER NOT NULL DEFAULT 0,
  product_id  INTEGER REFERENCES products(id) ON DELETE SET NULL,
  rating      SMALLINT CHECK (rating IS NULL OR (rating BETWEEN 1 AND 5)),
  image_urls  TEXT[] NOT NULL DEFAULT '{}',
  password_hash VARCHAR(255),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_community_posts_board_type ON community_posts(board_type, id DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_product_id ON community_posts(product_id);

CREATE TABLE IF NOT EXISTS community_comments (
  id          SERIAL PRIMARY KEY,
  post_id     INTEGER NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_community_comments_post_id ON community_comments(post_id);

-- 상품 옵션(색상/사이즈): 관리자가 설정한 값이 있을 때만 상세페이지에 선택창이 노출된다.
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS colors TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS sizes  TEXT[] NOT NULL DEFAULT '{}';

-- 장바구니/주문 아이템에 선택한 옵션을 함께 저장 (옵션 없는 상품은 빈 문자열).
ALTER TABLE cart_items
  ADD COLUMN IF NOT EXISTS color VARCHAR(50) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS size  VARCHAR(50) NOT NULL DEFAULT '';

ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_items_user_id_product_id_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_cart_items_user_product_variant
  ON cart_items(user_id, product_id, color, size);

ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS color VARCHAR(50) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS size  VARCHAR(50) NOT NULL DEFAULT '';

-- 가입 축하 쿠폰(3,000원)을 주문서에서 적용할 수 있도록 주문에 쿠폰/할인 금액을 기록.
-- total_amount는 할인 반영 후 실제 입금해야 할 금액, subtotal_amount는 할인 전 금액.
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS coupon_id       INTEGER REFERENCES user_coupons(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS discount_amount INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS subtotal_amount INTEGER NOT NULL DEFAULT 0;

UPDATE orders SET subtotal_amount = total_amount WHERE subtotal_amount = 0;

-- 배송시작 시 입력하는 택배사/운송장번호 (카카오채널 알림톡 발송 연동용).
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS courier_company VARCHAR(50),
  ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(50);

-- 구매자 주문취소 요청 -> 관리자 승인 플로우.
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS cancel_requested    BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS cancel_requested_at TIMESTAMPTZ;

-- 제조국(원산지) 표기: 관리자가 직접 입력, 상세페이지 사이즈 아래에 노출.
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS origin VARCHAR(100);

-- 연관 상품(거미줄식 연결): 한쪽에서 연결하면 양방향으로 저장되어 서로의
-- 상세페이지에 노출된다. (product_id, related_product_id) 순서쌍 + 역방향
-- 쌍을 함께 저장하므로 조회는 product_id 기준 단방향 SELECT면 충분하다.
CREATE TABLE IF NOT EXISTS product_relations (
  product_id         INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  related_product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, related_product_id),
  CHECK (product_id <> related_product_id)
);

CREATE INDEX IF NOT EXISTS idx_product_relations_related ON product_relations(related_product_id);

-- 적립금(마일리지) 원장: 적립(+)/사용(-) 내역을 기록하고 SUM(amount)으로 잔액을 계산한다.
-- 결제확인 시 결제금액의 2.5%를 적립하고, 주문 시 보유 잔액 내에서 사용할 수 있다.
CREATE TABLE IF NOT EXISTS mileage_transactions (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount     INTEGER NOT NULL,
  reason     VARCHAR(100) NOT NULL,
  order_id   INTEGER REFERENCES orders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mileage_transactions_user_id ON mileage_transactions(user_id);

-- 가격 아래에 노출되는 짧은 한줄 소개 (상세 설명 리치텍스트와 별개).
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS summary VARCHAR(300);

-- 메인페이지 히어로 배너(2026 S/S NEW ARRIVAL / BEST ITEM) 클릭 시 이동할 상품을
-- 품목등록에서 직접 지정한다. 슬롯당 상품 1개만 연결 가능(부분 유니크 인덱스),
-- 새로 지정하면 기존에 그 슬롯을 갖고 있던 상품 연결은 API에서 자동 해제한다.
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS hero_slot VARCHAR(20) CHECK (hero_slot IN ('new_arrival', 'best_item'));

CREATE UNIQUE INDEX IF NOT EXISTS idx_products_hero_slot_uniq ON products(hero_slot) WHERE hero_slot IS NOT NULL;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS mileage_used INTEGER NOT NULL DEFAULT 0;
