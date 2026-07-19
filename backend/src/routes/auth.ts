import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db/pool";
import { requireAuth, type AuthedRequest } from "../middleware/auth";

const router = Router();

const SIGNUP_COUPON_AMOUNT = 3000;
const SIGNUP_COUPON_VALID_DAYS = 90;

function issueToken(userId: number) {
  return jwt.sign({ userId }, process.env.JWT_SECRET as string, { expiresIn: "7d" });
}

router.post("/signup", async (req, res) => {
  const { email, password, name, phone, birthDate, region, zipCode, address, addressDetail } = req.body ?? {};

  if (!email || !password || !name || !birthDate || !region || !address) {
    return res.status(400).json({ error: "email, password, name, birthDate, region, address는 필수입니다." });
  }
  if (String(password).length < 8) {
    return res.status(400).json({ error: "비밀번호는 8자 이상이어야 합니다." });
  }

  const client = await pool.connect();
  try {
    const existing = await client.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "이미 가입된 이메일입니다." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await client.query("BEGIN");
    const userResult = await client.query(
      `INSERT INTO users (email, password_hash, name, phone, birth_date, region, zip_code, address, address_detail)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, email, name, phone, birth_date, region, zip_code, address, address_detail, created_at`,
      [email, passwordHash, name, phone ?? null, birthDate, region, zipCode ?? null, address, addressDetail ?? null]
    );
    const user = userResult.rows[0];

    const couponResult = await client.query(
      `INSERT INTO user_coupons (user_id, amount, reason, expires_at)
       VALUES ($1, $2, 'signup_welcome', now() + ($3 || ' days')::interval)
       RETURNING id, amount, reason, expires_at`,
      [user.id, SIGNUP_COUPON_AMOUNT, SIGNUP_COUPON_VALID_DAYS]
    );
    await client.query("COMMIT");

    const token = issueToken(user.id);
    return res.status(201).json({
      user,
      coupon: couponResult.rows[0],
      token,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    return res.status(500).json({ error: "회원가입 처리 중 오류가 발생했습니다." });
  } finally {
    client.release();
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    return res.status(400).json({ error: "email, password는 필수입니다." });
  }

  const result = await pool.query(
    "SELECT id, email, name, password_hash, is_admin FROM users WHERE email = $1",
    [email]
  );
  const user = result.rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." });
  }

  const token = issueToken(user.id);
  return res.json({
    user: { id: user.id, email: user.email, name: user.name, isAdmin: user.is_admin },
    token,
  });
});

router.get("/me", requireAuth, async (req: AuthedRequest, res) => {
  const userResult = await pool.query(
    "SELECT id, email, name, phone, birth_date, region, zip_code, address, address_detail, is_admin, created_at FROM users WHERE id = $1",
    [req.userId]
  );
  const user = userResult.rows[0];
  if (!user) {
    return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
  }

  const couponsResult = await pool.query(
    `SELECT id, amount, reason, is_used, issued_at, used_at, expires_at
     FROM user_coupons WHERE user_id = $1 ORDER BY issued_at DESC`,
    [req.userId]
  );

  res.json({ user, coupons: couponsResult.rows });
});

export default router;
