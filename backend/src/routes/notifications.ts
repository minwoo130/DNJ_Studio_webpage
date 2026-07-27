import { Router } from "express";
import { pool } from "../db/pool";
import { requireAuth, type AuthedRequest } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.get("/", async (req: AuthedRequest, res) => {
  const result = await pool.query(
    `SELECT id, order_id, message, is_read, created_at
     FROM notifications WHERE user_id = $1 ORDER BY id DESC LIMIT 20`,
    [req.userId]
  );
  res.json(
    result.rows.map((n) => ({
      id: n.id,
      orderId: n.order_id ?? undefined,
      message: n.message,
      isRead: n.is_read,
      createdAt: n.created_at,
    }))
  );
});

router.patch("/:id/read", async (req: AuthedRequest, res) => {
  const result = await pool.query(
    `UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING id`,
    [req.params.id, req.userId]
  );
  if (result.rows.length === 0) {
    return res.status(404).json({ error: "알림을 찾을 수 없습니다." });
  }
  res.json({ ok: true });
});

export default router;
