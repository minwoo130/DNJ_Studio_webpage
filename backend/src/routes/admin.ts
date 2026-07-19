import { Router } from "express";
import { pool } from "../db/pool";
import { requireAdminKey } from "../middleware/adminAuth";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

router.get("/users", requireAuth, requireAdmin, async (_req, res) => {
  const result = await pool.query(
    `SELECT id, email, name, phone, birth_date, region, is_admin, created_at
     FROM users
     ORDER BY id DESC`
  );
  res.json(
    result.rows.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      phone: u.phone ?? undefined,
      birthDate: u.birth_date ?? undefined,
      region: u.region ?? undefined,
      isAdmin: u.is_admin,
      createdAt: u.created_at,
    }))
  );
});

router.get("/orders", requireAuth, requireAdmin, async (_req, res) => {
  const orders = await pool.query(
    `SELECT o.id, o.status, o.total_amount, o.recipient_name, o.recipient_phone, o.zip_code,
            o.address, o.address_detail, o.memo, o.is_shipped, o.shipped_at, o.created_at,
            o.guest_name, o.guest_phone, o.guest_email,
            u.name AS member_name, u.email AS member_email, u.phone AS member_phone
     FROM orders o
     LEFT JOIN users u ON u.id = o.user_id
     ORDER BY o.id DESC`
  );

  const items = await pool.query(
    `SELECT oi.order_id, oi.product_id, oi.quantity, oi.price, p.name
     FROM order_items oi
     JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id = ANY($1::int[])`,
    [orders.rows.map((o) => o.id)]
  );

  res.json(
    orders.rows.map((o) => ({
      id: o.id,
      status: o.status,
      totalAmount: o.total_amount,
      recipientName: o.recipient_name,
      recipientPhone: o.recipient_phone,
      zipCode: o.zip_code ?? undefined,
      address: o.address,
      addressDetail: o.address_detail ?? undefined,
      memo: o.memo ?? undefined,
      isShipped: o.is_shipped,
      shippedAt: o.shipped_at ?? undefined,
      createdAt: o.created_at,
      member: o.member_email
        ? { name: o.member_name, email: o.member_email, phone: o.member_phone ?? undefined }
        : o.guest_name
          ? { name: o.guest_name, email: o.guest_email ?? undefined, phone: o.guest_phone ?? undefined, guest: true }
          : undefined,
      items: items.rows
        .filter((i) => i.order_id === o.id)
        .map((i) => ({ productId: i.product_id, name: i.name, quantity: i.quantity, price: i.price })),
    }))
  );
});

router.patch("/orders/:id/ship", requireAuth, requireAdmin, async (req, res) => {
  const { isShipped } = req.body ?? {};
  const result = await pool.query(
    `UPDATE orders
     SET is_shipped = $1, shipped_at = CASE WHEN $1 THEN now() ELSE NULL END
     WHERE id = $2
     RETURNING id`,
    [Boolean(isShipped), req.params.id]
  );
  if (result.rows.length === 0) {
    return res.status(404).json({ error: "주문을 찾을 수 없습니다." });
  }
  res.json({ ok: true });
});

router.use(requireAdminKey);

// Manually issue a coupon to a member — e.g. as compensation when something goes wrong.
router.post("/coupons/issue", async (req, res) => {
  const { email, amount, reason, expiresInDays } = req.body ?? {};
  if (!email || !amount || !reason) {
    return res.status(400).json({ error: "email, amount, reason은 필수입니다." });
  }

  const userResult = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
  const user = userResult.rows[0];
  if (!user) {
    return res.status(404).json({ error: "해당 이메일의 회원을 찾을 수 없습니다." });
  }

  const couponResult = await pool.query(
    `INSERT INTO user_coupons (user_id, amount, reason, expires_at)
     VALUES ($1, $2, $3, CASE WHEN $4::int IS NULL THEN NULL ELSE now() + ($4 || ' days')::interval END)
     RETURNING id, amount, reason, expires_at, issued_at`,
    [user.id, amount, reason, expiresInDays ?? null]
  );

  res.status(201).json(couponResult.rows[0]);
});

export default router;
