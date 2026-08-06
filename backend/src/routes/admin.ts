import { Router } from "express";
import { pool } from "../db/pool";
import { requireAdminKey } from "../middleware/adminAuth";
import { requireAuth, requireAdmin, type AuthedRequest } from "../middleware/auth";

const router = Router();

const MILEAGE_EARN_RATE = 0.025;

router.get("/users", requireAuth, requireAdmin, async (_req, res) => {
  const result = await pool.query(
    `SELECT id, email, name, phone, birth_date, region, is_admin, is_active, created_at
     FROM users
     WHERE is_active = true
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
      isActive: u.is_active,
      createdAt: u.created_at,
    }))
  );
});

router.patch("/users/:id/withdraw", requireAuth, requireAdmin, async (req: AuthedRequest, res) => {
  const targetId = Number(req.params.id);
  if (targetId === req.userId) {
    return res.status(400).json({ error: "본인 계정은 탈퇴 처리할 수 없습니다." });
  }

  const target = await pool.query("SELECT is_admin FROM users WHERE id = $1", [targetId]);
  if (target.rows.length === 0) {
    return res.status(404).json({ error: "회원을 찾을 수 없습니다." });
  }
  if (target.rows[0].is_admin) {
    return res.status(400).json({ error: "관리자 계정은 탈퇴 처리할 수 없습니다." });
  }

  await pool.query("UPDATE users SET is_active = false WHERE id = $1", [targetId]);
  res.json({ ok: true });
});

// 관리자가 회원관리 화면에서 직접 금액을 입력해 쿠폰(적립금)을 지급.
router.post("/users/:id/coupons", requireAuth, requireAdmin, async (req: AuthedRequest, res) => {
  const targetId = Number(req.params.id);
  const { amount, reason } = req.body ?? {};
  const amountNum = Number(amount);
  if (!Number.isInteger(amountNum) || amountNum <= 0) {
    return res.status(400).json({ error: "지급할 금액을 올바르게 입력해주세요." });
  }

  const target = await pool.query("SELECT id FROM users WHERE id = $1", [targetId]);
  if (target.rows.length === 0) {
    return res.status(404).json({ error: "회원을 찾을 수 없습니다." });
  }

  const couponResult = await pool.query(
    `INSERT INTO user_coupons (user_id, amount, reason)
     VALUES ($1, $2, $3)
     RETURNING id, amount, reason, issued_at`,
    [targetId, amountNum, typeof reason === "string" && reason.trim() ? reason.trim() : "관리자 지급"]
  );
  await pool.query(`INSERT INTO notifications (user_id, message) VALUES ($1, $2)`, [
    targetId,
    `${amountNum.toLocaleString()}원 쿠폰이 지급되었습니다.`,
  ]);
  res.status(201).json(couponResult.rows[0]);
});

router.get("/orders", requireAuth, requireAdmin, async (_req, res) => {
  const orders = await pool.query(
    `SELECT o.id, o.status, o.total_amount, o.subtotal_amount, o.discount_amount, o.coupon_id,
            o.recipient_name, o.recipient_phone, o.zip_code,
            o.address, o.address_detail, o.memo, o.is_shipped, o.shipped_at, o.created_at,
            o.guest_name, o.guest_phone, o.guest_email,
            o.courier_company, o.tracking_number, o.cancel_requested, o.cancel_requested_at,
            o.payment_method, o.payment_status, o.depositor_name, o.deposit_deadline, o.paid_at,
            u.name AS member_name, u.email AS member_email, u.phone AS member_phone
     FROM orders o
     LEFT JOIN users u ON u.id = o.user_id
     ORDER BY o.id DESC`
  );

  const items = await pool.query(
    `SELECT oi.order_id, oi.product_id, oi.quantity, oi.price, oi.color, oi.size, p.name, p.image_url
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
      subtotalAmount: o.subtotal_amount,
      discountAmount: o.discount_amount,
      couponId: o.coupon_id ?? undefined,
      recipientName: o.recipient_name,
      recipientPhone: o.recipient_phone,
      zipCode: o.zip_code ?? undefined,
      address: o.address,
      addressDetail: o.address_detail ?? undefined,
      memo: o.memo ?? undefined,
      isShipped: o.is_shipped,
      shippedAt: o.shipped_at ?? undefined,
      courierCompany: o.courier_company ?? undefined,
      trackingNumber: o.tracking_number ?? undefined,
      cancelRequested: o.cancel_requested,
      cancelRequestedAt: o.cancel_requested_at ?? undefined,
      createdAt: o.created_at,
      paymentMethod: o.payment_method,
      paymentStatus: o.payment_status,
      depositorName: o.depositor_name ?? undefined,
      depositDeadline: o.deposit_deadline ?? undefined,
      paidAt: o.paid_at ?? undefined,
      member: o.member_email
        ? { name: o.member_name, email: o.member_email, phone: o.member_phone ?? undefined }
        : o.guest_name
          ? { name: o.guest_name, email: o.guest_email ?? undefined, phone: o.guest_phone ?? undefined, guest: true }
          : undefined,
      items: items.rows
        .filter((i) => i.order_id === o.id)
        .map((i) => ({
          productId: i.product_id,
          name: i.name,
          quantity: i.quantity,
          price: i.price,
          color: i.color || undefined,
          size: i.size || undefined,
          imageUrl: i.image_url ?? `/products/${i.product_id}.jpg`,
        })),
    }))
  );
});

router.patch("/orders/:id/ship", requireAuth, requireAdmin, async (req, res) => {
  const { isShipped, courierCompany, trackingNumber } = req.body ?? {};
  const shipped = Boolean(isShipped);
  if (shipped && !String(trackingNumber ?? "").trim()) {
    return res.status(400).json({ error: "운송장번호를 입력해주세요." });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query(
      `UPDATE orders
       SET is_shipped = $1,
           shipped_at = CASE WHEN $1 THEN now() ELSE NULL END,
           courier_company = CASE WHEN $1 THEN $3 ELSE NULL END,
           tracking_number = CASE WHEN $1 THEN $4 ELSE NULL END
       WHERE id = $2
       RETURNING id, user_id, is_shipped`,
      [shipped, req.params.id, courierCompany?.trim() || null, trackingNumber?.trim() || null]
    );
    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "주문을 찾을 수 없습니다." });
    }
    const { id, user_id } = result.rows[0];
    // 배송시작(false -> true) 전환일 때만 알림을 보낸다. 실수로 켰다가 되돌리는 경우는 알림 없음.
    if (shipped && user_id) {
      const courierText = courierCompany?.trim() ? `${courierCompany.trim()} ` : "";
      await client.query(
        `INSERT INTO notifications (user_id, order_id, message) VALUES ($1, $2, $3)`,
        [user_id, id, `주문 #${id} 배송이 시작되었습니다. (${courierText}${trackingNumber.trim()})`]
      );
    }
    await client.query("COMMIT");
    res.json({ ok: true });
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
});

router.patch("/orders/:id/confirm-payment", requireAuth, requireAdmin, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query(
      `UPDATE orders
       SET payment_status = 'PAID', paid_at = now(), status = 'preparing'
       WHERE id = $1 AND payment_status = 'WAITING'
       RETURNING id, user_id, total_amount`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "입금 대기 중인 주문을 찾을 수 없습니다." });
    }
    const { id, user_id, total_amount } = result.rows[0];
    if (user_id) {
      // 결제확인 시 결제금액의 2.5%를 적립금으로 지급 (상품 카드에 안내된 "적립금 2.5%"와 동일 비율).
      const mileageEarned = Math.round(total_amount * MILEAGE_EARN_RATE);
      let message = `주문 #${id} 입금이 확인되어 상품 준비중입니다.`;
      if (mileageEarned > 0) {
        await client.query(
          `INSERT INTO mileage_transactions (user_id, amount, reason, order_id) VALUES ($1, $2, 'purchase', $3)`,
          [user_id, mileageEarned, id]
        );
        message += ` (적립금 ${mileageEarned.toLocaleString()}원 적립)`;
      }
      await client.query(
        `INSERT INTO notifications (user_id, order_id, message) VALUES ($1, $2, $3)`,
        [user_id, id, message]
      );
    }
    await client.query("COMMIT");
    res.json({ ok: true });
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
});

router.patch("/orders/:id/cancel", requireAuth, requireAdmin, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query(
      `UPDATE orders
       SET payment_status = 'CANCELLED', status = 'cancelled', cancel_requested = false
       WHERE id = $1 AND payment_status != 'CANCELLED'
       RETURNING id, user_id`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "주문을 찾을 수 없거나 이미 취소되었습니다." });
    }
    const { id, user_id } = result.rows[0];
    if (user_id) {
      await client.query(
        `INSERT INTO notifications (user_id, order_id, message) VALUES ($1, $2, $3)`,
        [user_id, id, `주문 #${id}이(가) 취소되었습니다.`]
      );
    }
    await client.query("COMMIT");
    res.json({ ok: true });
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
});

// 구매자가 취소를 요청했지만 관리자가 (환불 절차 등을 이유로) 요청만 반려하고 주문은 유지할 때 사용.
router.patch("/orders/:id/decline-cancel-request", requireAuth, requireAdmin, async (req, res) => {
  const result = await pool.query(
    `UPDATE orders SET cancel_requested = false WHERE id = $1 AND cancel_requested = true RETURNING id`,
    [req.params.id]
  );
  if (result.rows.length === 0) {
    return res.status(404).json({ error: "취소 요청을 찾을 수 없습니다." });
  }
  res.json({ ok: true });
});

// 관리자가 주문을 목록에서 완전히 삭제 (실수 방지를 위해 프런트에서 "삭제하기" 입력을 확인받는다).
router.delete("/orders/:id", requireAuth, requireAdmin, async (req, res) => {
  const result = await pool.query("DELETE FROM orders WHERE id = $1 RETURNING id", [req.params.id]);
  if (result.rows.length === 0) {
    return res.status(404).json({ error: "주문을 찾을 수 없습니다." });
  }
  res.status(204).send();
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
