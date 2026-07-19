import { Router } from "express";
import { pool } from "../db/pool";
import { requireAuth, type AuthedRequest } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.get("/", async (req: AuthedRequest, res) => {
  const result = await pool.query(
    `SELECT p.id, p.name, p.price, p.original_price, p.badge, p.category, p.image_url
     FROM wishlist_items w
     JOIN products p ON p.id = w.product_id
     WHERE w.user_id = $1
     ORDER BY w.created_at DESC`,
    [req.userId]
  );

  res.json(
    result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      price: row.price,
      originalPrice: row.original_price ?? undefined,
      badge: row.badge ?? undefined,
      category: row.category,
      imageUrl: row.image_url ?? `/products/${row.id}.jpg`,
    }))
  );
});

router.post("/", async (req: AuthedRequest, res) => {
  const { productId } = req.body ?? {};
  if (!productId) {
    return res.status(400).json({ error: "productId는 필수입니다." });
  }

  const product = await pool.query("SELECT id FROM products WHERE id = $1", [productId]);
  if (product.rows.length === 0) {
    return res.status(404).json({ error: "상품을 찾을 수 없습니다." });
  }

  await pool.query(
    `INSERT INTO wishlist_items (user_id, product_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id, product_id) DO NOTHING`,
    [req.userId, productId]
  );
  res.status(201).json({ ok: true });
});

router.delete("/:productId", async (req: AuthedRequest, res) => {
  const result = await pool.query(
    "DELETE FROM wishlist_items WHERE user_id = $1 AND product_id = $2 RETURNING id",
    [req.userId, req.params.productId]
  );
  if (result.rows.length === 0) {
    return res.status(404).json({ error: "위시리스트에 없는 상품입니다." });
  }
  res.status(204).send();
});

export default router;
