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

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(PORT, () => {
  console.log(`backend listening on :${PORT}`);
});
