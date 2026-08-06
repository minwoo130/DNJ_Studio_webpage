import { Router } from "express";
import { pool } from "../db/pool";
import { requireAuth, type AuthedRequest } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.get("/", async (req: AuthedRequest, res) => {
  const result = await pool.query(
    `SELECT c.id, c.product_id, c.quantity, c.color, c.size,
            p.name, p.price, p.original_price, p.badge, p.category, p.image_url
     FROM cart_items c
     JOIN products p ON p.id = c.product_id
     WHERE c.user_id = $1
     ORDER BY c.created_at DESC`,
    [req.userId]
  );

  const items = result.rows.map((row) => ({
    id: row.id,
    productId: row.product_id,
    name: row.name,
    price: row.price,
    originalPrice: row.original_price ?? undefined,
    badge: row.badge ?? undefined,
    category: row.category,
    quantity: row.quantity,
    color: row.color || undefined,
    size: row.size || undefined,
    imageUrl: row.image_url ?? `/products/${row.product_id}.jpg`,
  }));

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  res.json({ items, total });
});

router.post("/", async (req: AuthedRequest, res) => {
  const { productId, quantity, color, size } = req.body ?? {};
  if (!productId) {
    return res.status(400).json({ error: "productId는 필수입니다." });
  }
  const qty = Number(quantity) > 0 ? Number(quantity) : 1;

  const product = await pool.query("SELECT id, colors, sizes FROM products WHERE id = $1", [productId]);
  if (product.rows.length === 0) {
    return res.status(404).json({ error: "상품을 찾을 수 없습니다." });
  }
  const { colors, sizes } = product.rows[0] as { colors: string[]; sizes: string[] };

  const selectedColor = String(color ?? "").trim();
  const selectedSize = String(size ?? "").trim();
  if (colors?.length && !colors.includes(selectedColor)) {
    return res.status(400).json({ error: "색상을 선택해주세요." });
  }
  if (sizes?.length && !sizes.includes(selectedSize)) {
    return res.status(400).json({ error: "사이즈를 선택해주세요." });
  }

  await pool.query(
    `INSERT INTO cart_items (user_id, product_id, quantity, color, size)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (user_id, product_id, color, size)
     DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity`,
    [req.userId, productId, qty, colors?.length ? selectedColor : "", sizes?.length ? selectedSize : ""]
  );

  res.status(201).json({ ok: true });
});

router.patch("/:id", async (req: AuthedRequest, res) => {
  const { quantity } = req.body ?? {};
  if (!quantity || Number(quantity) <= 0) {
    return res.status(400).json({ error: "quantity는 1 이상이어야 합니다." });
  }

  const result = await pool.query(
    "UPDATE cart_items SET quantity = $1 WHERE id = $2 AND user_id = $3 RETURNING id",
    [Number(quantity), req.params.id, req.userId]
  );
  if (result.rows.length === 0) {
    return res.status(404).json({ error: "장바구니에 없는 상품입니다." });
  }
  res.json({ ok: true });
});

router.delete("/:id", async (req: AuthedRequest, res) => {
  const result = await pool.query(
    "DELETE FROM cart_items WHERE id = $1 AND user_id = $2 RETURNING id",
    [req.params.id, req.userId]
  );
  if (result.rows.length === 0) {
    return res.status(404).json({ error: "장바구니에 없는 상품입니다." });
  }
  res.status(204).send();
});

export default router;
