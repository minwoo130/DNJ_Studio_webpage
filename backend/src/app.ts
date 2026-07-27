import "dotenv/config";
import path from "path";
import express from "express";
import cors from "cors";
import authRouter from "./routes/auth";
import productsRouter from "./routes/products";
import cartRouter from "./routes/cart";
import wishlistRouter from "./routes/wishlist";
import adminRouter from "./routes/admin";
import communityRouter from "./routes/community";
import ordersRouter from "./routes/orders";
import notificationsRouter from "./routes/notifications";
import { pool } from "./db/pool";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/cart", cartRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/admin", adminRouter);
app.use("/api/community", communityRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/notifications", notificationsRouter);

// 입금기한이 지난 무통장입금 대기 주문을 주기적으로 자동 취소한다.
// 단일 백엔드 프로세스 전제 (레플리카가 늘면 별도 스케줄러/락으로 교체 필요).
const DEPOSIT_CHECK_INTERVAL_MS = 10 * 60 * 1000;

async function cancelExpiredDeposits() {
  try {
    const result = await pool.query(
      `UPDATE orders
       SET payment_status = 'CANCELLED', status = 'cancelled'
       WHERE payment_status = 'WAITING' AND deposit_deadline < now()
       RETURNING id, user_id`
    );
    for (const row of result.rows) {
      if (!row.user_id) continue;
      await pool.query(
        `INSERT INTO notifications (user_id, order_id, message) VALUES ($1, $2, $3)`,
        [row.user_id, row.id, `주문 #${row.id}이(가) 입금기한 초과로 자동 취소되었습니다.`]
      );
    }
  } catch (err) {
    console.error("입금기한 자동취소 작업 실패:", err);
  }
}

setInterval(cancelExpiredDeposits, DEPOSIT_CHECK_INTERVAL_MS);

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(PORT, () => {
  console.log(`backend listening on :${PORT}`);
});
