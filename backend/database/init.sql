CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name          VARCHAR(100) NOT NULL,
  phone         VARCHAR(20),
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
