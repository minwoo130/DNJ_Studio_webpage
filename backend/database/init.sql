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
  detail_content TEXT NOT NULL DEFAULT '',
  is_weekly_best BOOLEAN NOT NULL DEFAULT false,
  is_new_arrival BOOLEAN NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING GIN(tags);

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

CREATE TABLE IF NOT EXISTS order_items (
  id          SERIAL PRIMARY KEY,
  order_id    INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity    INTEGER NOT NULL,
  price       INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

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
