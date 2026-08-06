import { Router } from "express";
import { pool } from "../db/pool";
import { requireAuth, optionalAuth, type AuthedRequest } from "../middleware/auth";

const router = Router();

// 로그인 없이도 계좌 안내를 볼 수 있어야 하므로 인증 미들웨어보다 앞에 둔다.
router.get("/bank-info", (_req, res) => {
  res.json({
    bankName: process.env.BANK_NAME ?? "",
    accountNumber: process.env.BANK_ACCOUNT_NUMBER ?? "",
    accountHolder: process.env.BANK_ACCOUNT_HOLDER ?? "",
  });
});

router.get("/", requireAuth, async (req: AuthedRequest, res) => {
  const orders = await pool.query(
    `SELECT id, status, total_amount, subtotal_amount, discount_amount, coupon_id, mileage_used,
            recipient_name, recipient_phone, zip_code, address,
            address_detail, memo, is_shipped, courier_company, tracking_number, created_at,
            cancel_requested,
            payment_method, payment_status, depositor_name, deposit_deadline, paid_at
     FROM orders WHERE user_id = $1 ORDER BY id DESC`,
    [req.userId]
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
      mileageUsed: o.mileage_used,
      recipientName: o.recipient_name,
      recipientPhone: o.recipient_phone,
      zipCode: o.zip_code ?? undefined,
      address: o.address,
      addressDetail: o.address_detail ?? undefined,
      memo: o.memo ?? undefined,
      isShipped: o.is_shipped,
      courierCompany: o.courier_company ?? undefined,
      trackingNumber: o.tracking_number ?? undefined,
      cancelRequested: o.cancel_requested,
      createdAt: o.created_at,
      paymentMethod: o.payment_method,
      paymentStatus: o.payment_status,
      depositorName: o.depositor_name ?? undefined,
      depositDeadline: o.deposit_deadline ?? undefined,
      paidAt: o.paid_at ?? undefined,
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

router.get("/purchased/:productId", requireAuth, async (req: AuthedRequest, res) => {
  const result = await pool.query(
    `SELECT 1 FROM order_items oi
     JOIN orders o ON o.id = oi.order_id
     WHERE o.user_id = $1 AND oi.product_id = $2
     LIMIT 1`,
    [req.userId, req.params.productId]
  );
  res.json({ purchased: result.rows.length > 0 });
});

router.patch("/:id/request-cancel", requireAuth, async (req: AuthedRequest, res) => {
  const result = await pool.query(
    `UPDATE orders
     SET cancel_requested = true, cancel_requested_at = now()
     WHERE id = $1 AND user_id = $2 AND is_shipped = false
       AND payment_status != 'CANCELLED' AND cancel_requested = false
     RETURNING id`,
    [req.params.id, req.userId]
  );
  if (result.rows.length === 0) {
    return res.status(400).json({ error: "취소를 요청할 수 없는 주문입니다." });
  }
  res.json({ ok: true });
});

router.get("/:id", optionalAuth, async (req: AuthedRequest, res) => {
  if (!req.userId && !String(req.query.phone ?? "").trim()) {
    return res.status(404).json({ error: "주문을 찾을 수 없습니다." });
  }

  const orderResult = req.userId
    ? await pool.query(
        `SELECT id, status, total_amount, subtotal_amount, discount_amount, coupon_id, mileage_used,
                recipient_name, recipient_phone, zip_code, address,
                address_detail, memo, is_shipped, courier_company, tracking_number, created_at,
                payment_method, payment_status, depositor_name, deposit_deadline, paid_at
         FROM orders WHERE id = $1 AND user_id = $2`,
        [req.params.id, req.userId]
      )
    : await pool.query(
        `SELECT id, status, total_amount, subtotal_amount, discount_amount, coupon_id, mileage_used,
                recipient_name, recipient_phone, zip_code, address,
                address_detail, memo, is_shipped, courier_company, tracking_number, created_at,
                payment_method, payment_status, depositor_name, deposit_deadline, paid_at
         FROM orders WHERE id = $1 AND user_id IS NULL AND guest_phone = $2`,
        [req.params.id, String(req.query.phone ?? "")]
      );
  const o = orderResult.rows[0];
  if (!o) {
    return res.status(404).json({ error: "주문을 찾을 수 없습니다." });
  }

  const items = await pool.query(
    `SELECT oi.product_id, oi.quantity, oi.price, oi.color, oi.size, p.name, p.image_url
     FROM order_items oi
     JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id = $1`,
    [o.id]
  );

  res.json({
    id: o.id,
    status: o.status,
    totalAmount: o.total_amount,
    subtotalAmount: o.subtotal_amount,
    discountAmount: o.discount_amount,
    couponId: o.coupon_id ?? undefined,
    mileageUsed: o.mileage_used,
    recipientName: o.recipient_name,
    recipientPhone: o.recipient_phone,
    zipCode: o.zip_code ?? undefined,
    address: o.address,
    addressDetail: o.address_detail ?? undefined,
    memo: o.memo ?? undefined,
    isShipped: o.is_shipped,
    courierCompany: o.courier_company ?? undefined,
    trackingNumber: o.tracking_number ?? undefined,
    createdAt: o.created_at,
    paymentMethod: o.payment_method,
    paymentStatus: o.payment_status,
    depositorName: o.depositor_name ?? undefined,
    depositDeadline: o.deposit_deadline ?? undefined,
    paidAt: o.paid_at ?? undefined,
    items: items.rows.map((i) => ({
      productId: i.product_id,
      name: i.name,
      quantity: i.quantity,
      price: i.price,
      color: i.color || undefined,
      size: i.size || undefined,
      imageUrl: i.image_url ?? `/products/${i.product_id}.jpg`,
    })),
  });
});

router.post("/", optionalAuth, async (req: AuthedRequest, res) => {
  const {
    recipientName,
    recipientPhone,
    zipCode,
    address,
    addressDetail,
    memo,
    depositorName,
    items,
    guestName,
    guestPhone,
    guestEmail,
    couponId,
    mileageUsed,
  } = req.body ?? {};
  if (!recipientName?.trim() || !recipientPhone?.trim() || !address?.trim()) {
    return res.status(400).json({ error: "수령인/연락처/주소는 필수입니다." });
  }

  // "바로구매": 장바구니를 거치지 않고 요청받은 상품만으로 바로 주문을 생성한다 (장바구니는 건드리지 않음).
  const isBuyNow = Array.isArray(items) && items.length > 0;

  if (!req.userId) {
    // 비회원은 서버에 저장된 장바구니가 없으므로 바로구매(items 전달) 방식으로만 주문할 수 있다.
    if (!isBuyNow) {
      return res.status(401).json({ error: "장바구니 주문은 로그인이 필요합니다." });
    }
    if (!guestName?.trim() || !guestPhone?.trim()) {
      return res.status(400).json({ error: "주문자명/휴대폰번호는 필수입니다." });
    }
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    let orderItems: { product_id: number; quantity: number; price: number; color: string; size: string }[];
    if (isBuyNow) {
      const productIds = items.map((i: { productId: number }) => Number(i.productId));
      const productResult = await client.query(
        `SELECT id, price, colors, sizes FROM products WHERE id = ANY($1::int[])`,
        [productIds]
      );
      const productById = new Map(productResult.rows.map((p) => [p.id, p]));
      if (productById.size !== new Set(productIds).size) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: "상품을 찾을 수 없습니다." });
      }

      orderItems = [];
      for (const i of items as { productId: number; quantity: number; color?: string; size?: string }[]) {
        const p = productById.get(Number(i.productId))!;
        const selectedColor = String(i.color ?? "").trim();
        const selectedSize = String(i.size ?? "").trim();
        if (p.colors?.length && !p.colors.includes(selectedColor)) {
          await client.query("ROLLBACK");
          return res.status(400).json({ error: "색상을 선택해주세요." });
        }
        if (p.sizes?.length && !p.sizes.includes(selectedSize)) {
          await client.query("ROLLBACK");
          return res.status(400).json({ error: "사이즈를 선택해주세요." });
        }
        orderItems.push({
          product_id: Number(i.productId),
          quantity: Math.max(1, Number(i.quantity) || 1),
          price: p.price,
          color: p.colors?.length ? selectedColor : "",
          size: p.sizes?.length ? selectedSize : "",
        });
      }
    } else {
      const cart = await client.query(
        `SELECT c.product_id, c.quantity, c.color, c.size, p.price
         FROM cart_items c
         JOIN products p ON p.id = c.product_id
         WHERE c.user_id = $1`,
        [req.userId]
      );

      if (cart.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: "장바구니가 비어 있습니다." });
      }
      orderItems = cart.rows;
    }

    const subtotal = orderItems.reduce((sum, row) => sum + row.price * row.quantity, 0);

    let discount = 0;
    let appliedCouponId: number | null = null;
    if (couponId && req.userId) {
      const couponResult = await client.query(
        `SELECT id, amount FROM user_coupons
         WHERE id = $1 AND user_id = $2 AND is_used = false AND (expires_at IS NULL OR expires_at > now())`,
        [couponId, req.userId]
      );
      if (couponResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: "사용할 수 없는 쿠폰입니다." });
      }
      appliedCouponId = couponResult.rows[0].id;
      discount = Math.min(couponResult.rows[0].amount, subtotal);
    }

    // 적립금은 로그인 회원만 사용할 수 있고, 쿠폰 할인 이후 남은 금액과 보유 잔액을 넘을 수 없다.
    let mileageSpent = 0;
    const requestedMileage = Math.max(0, Math.floor(Number(mileageUsed)) || 0);
    if (req.userId && requestedMileage > 0) {
      const balanceResult = await client.query(
        `SELECT COALESCE(SUM(amount), 0) AS balance FROM mileage_transactions WHERE user_id = $1`,
        [req.userId]
      );
      const balance = Number(balanceResult.rows[0].balance);
      const maxUsable = Math.max(0, subtotal - discount);
      mileageSpent = Math.min(requestedMileage, balance, maxUsable);
    }

    const total = subtotal - discount - mileageSpent;

    const order = await client.query(
      `INSERT INTO orders
        (user_id, guest_name, guest_phone, guest_email, status, subtotal_amount, discount_amount, coupon_id,
         mileage_used, total_amount, recipient_name, recipient_phone,
         zip_code, address, address_detail, memo,
         payment_method, payment_status, depositor_name, deposit_deadline)
       VALUES ($1, $2, $3, $4, 'placed', $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
               'BANK_TRANSFER', 'WAITING', $16, now() + interval '3 days')
       RETURNING id, deposit_deadline`,
      [
        req.userId ?? null,
        req.userId ? null : guestName.trim(),
        req.userId ? null : guestPhone.trim(),
        req.userId ? null : guestEmail?.trim() || null,
        subtotal,
        discount,
        appliedCouponId,
        mileageSpent,
        total,
        recipientName.trim(),
        recipientPhone.trim(),
        zipCode?.trim() || null,
        address.trim(),
        addressDetail?.trim() || null,
        memo?.trim() || null,
        depositorName?.trim() || recipientName.trim(),
      ]
    );
    const orderId = order.rows[0].id;

    if (mileageSpent > 0) {
      await client.query(
        `INSERT INTO mileage_transactions (user_id, amount, reason, order_id) VALUES ($1, $2, 'order_use', $3)`,
        [req.userId, -mileageSpent, orderId]
      );
    }

    for (const row of orderItems) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price, color, size) VALUES ($1, $2, $3, $4, $5, $6)`,
        [orderId, row.product_id, row.quantity, row.price, row.color, row.size]
      );
    }

    if (appliedCouponId) {
      await client.query(
        `UPDATE user_coupons SET is_used = true, used_at = now() WHERE id = $1`,
        [appliedCouponId]
      );
    }

    if (!isBuyNow) {
      await client.query("DELETE FROM cart_items WHERE user_id = $1", [req.userId]);
    }
    await client.query("COMMIT");

    res.status(201).json({ id: orderId, depositDeadline: order.rows[0].deposit_deadline, mileageUsed: mileageSpent });
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
});

export default router;
