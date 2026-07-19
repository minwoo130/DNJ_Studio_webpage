import { Router } from "express";
import { pool } from "../db/pool";
import { requireAuth, type AuthedRequest } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.get("/", async (req: AuthedRequest, res) => {
  const result = await pool.query(
    `SELECT c.product_id, c.quantity, p.name, p.price, p.original_price, p.badge, p.category, p.image_url
     FROM cart_items c
     JOIN products p ON p.id = c.product_id
     WHERE c.user_id = $1
     ORDER BY c.created_at DESC`,
    [req.userId]
  );

  const items = result.rows.map((row) => ({
    productId: row.product_id,
    name: row.name,
    price: row.price,
    originalPrice: row.original_price ?? undefined,
    badge: row.badge ?? undefined,
    category: row.category,
    quantity: row.quantity,
    imageUrl: row.image_url ?? `/products/${row.product_id}.jpg`,
  }));

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  res.json({ items, total });
});

router.post("/", async (req: AuthedRequest, res) => {
  const { productId, quantity } = req.body ?? {};
  if (!productId) {
    return res.status(400).json({ error: "productId는 필수입니다." });
  }
  const qty = Number(quantity) > 0 ? Number(quantity) : 1;

  const product = await pool.query("SELECT id FROM products WHERE id = $1", [productId]);
  if (product.rows.length === 0) {
    return res.status(404).json({ error: "상품을 찾을 수 없습니다." });
  }

  await pool.query(
    `INSERT INTO cart_items (user_id, product_id, quantity)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, product_id)
     DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity`,
    [req.userId, productId, qty]
  );

  res.status(201).json({ ok: true });
});

router.patch("/:productId", async (req: AuthedRequest, res) => {
  const { quantity } = req.body ?? {};
  if (!quantity || Number(quantity) <= 0) {
    return res.status(400).json({ error: "quantity는 1 이상이어야 합니다." });
  }

  const result = await pool.query(
    "UPDATE cart_items SET quantity = $1 WHERE user_id = $2 AND product_id = $3 RETURNING id",
    [Number(quantity), req.userId, req.params.productId]
  );
  if (result.rows.length === 0) {
    return res.status(404).json({ error: "장바구니에 없는 상품입니다." });
  }
  res.json({ ok: true });
});

router.delete("/:productId", async (req: AuthedRequest, res) => {
  const result = await pool.query(
    "DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2 RETURNING id",
    [req.userId, req.params.productId]
  );
  if (result.rows.length === 0) {
    return res.status(404).json({ error: "장바구니에 없는 상품입니다." });
  }
  res.status(204).send();
});

export default router;
