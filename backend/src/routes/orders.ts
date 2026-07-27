import { Router } from "express";
import { pool } from "../db/pool";
import { requireAuth, type AuthedRequest } from "../middleware/auth";

const router = Router();

// 로그인 없이도 계좌 안내를 볼 수 있어야 하므로 requireAuth보다 앞에 둔다.
router.get("/bank-info", (_req, res) => {
  res.json({
    bankName: process.env.BANK_NAME ?? "",
    accountNumber: process.env.BANK_ACCOUNT_NUMBER ?? "",
    accountHolder: process.env.BANK_ACCOUNT_HOLDER ?? "",
  });
});

router.use(requireAuth);

router.get("/", async (req: AuthedRequest, res) => {
  const orders = await pool.query(
    `SELECT id, status, total_amount, recipient_name, recipient_phone, zip_code, address,
            address_detail, memo, is_shipped, created_at,
            payment_method, payment_status, depositor_name, deposit_deadline, paid_at
     FROM orders WHERE user_id = $1 ORDER BY id DESC`,
    [req.userId]
  );

  const items = await pool.query(
    `SELECT oi.order_id, oi.product_id, oi.quantity, oi.price, p.name, p.image_url
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
          imageUrl: i.image_url ?? `/products/${i.product_id}.jpg`,
        })),
    }))
  );
});

router.get("/purchased/:productId", async (req: AuthedRequest, res) => {
  const result = await pool.query(
    `SELECT 1 FROM order_items oi
     JOIN orders o ON o.id = oi.order_id
     WHERE o.user_id = $1 AND oi.product_id = $2
     LIMIT 1`,
    [req.userId, req.params.productId]
  );
  res.json({ purchased: result.rows.length > 0 });
});

router.get("/:id", async (req: AuthedRequest, res) => {
  const orderResult = await pool.query(
    `SELECT id, status, total_amount, recipient_name, recipient_phone, zip_code, address,
            address_detail, memo, is_shipped, created_at,
            payment_method, payment_status, depositor_name, deposit_deadline, paid_at
     FROM orders WHERE id = $1 AND user_id = $2`,
    [req.params.id, req.userId]
  );
  const o = orderResult.rows[0];
  if (!o) {
    return res.status(404).json({ error: "주문을 찾을 수 없습니다." });
  }

  const items = await pool.query(
    `SELECT oi.product_id, oi.quantity, oi.price, p.name, p.image_url
     FROM order_items oi
     JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id = $1`,
    [o.id]
  );

  res.json({
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
      imageUrl: i.image_url ?? `/products/${i.product_id}.jpg`,
    })),
  });
});

router.post("/", async (req: AuthedRequest, res) => {
  const { recipientName, recipientPhone, zipCode, address, addressDetail, memo, depositorName } = req.body ?? {};
  if (!recipientName?.trim() || !recipientPhone?.trim() || !address?.trim()) {
    return res.status(400).json({ error: "수령인/연락처/주소는 필수입니다." });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const cart = await client.query(
      `SELECT c.product_id, c.quantity, p.price
       FROM cart_items c
       JOIN products p ON p.id = c.product_id
       WHERE c.user_id = $1`,
      [req.userId]
    );

    if (cart.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "장바구니가 비어 있습니다." });
    }

    const total = cart.rows.reduce((sum, row) => sum + row.price * row.quantity, 0);

    const order = await client.query(
      `INSERT INTO orders
        (user_id, status, total_amount, recipient_name, recipient_phone, zip_code, address, address_detail, memo,
         payment_method, payment_status, depositor_name, deposit_deadline)
       VALUES ($1, 'placed', $2, $3, $4, $5, $6, $7, $8,
               'BANK_TRANSFER', 'WAITING', $9, now() + interval '3 days')
       RETURNING id, deposit_deadline`,
      [
        req.userId,
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

    for (const row of cart.rows) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)`,
        [orderId, row.product_id, row.quantity, row.price]
      );
    }

    await client.query("DELETE FROM cart_items WHERE user_id = $1", [req.userId]);
    await client.query("COMMIT");

    res.status(201).json({ id: orderId, depositDeadline: order.rows[0].deposit_deadline });
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
});

export default router;
