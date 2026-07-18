import "dotenv/config";
import express from "express";
import cors from "cors";
import authRouter from "./routes/auth";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRouter);

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(PORT, () => {
  console.log(`backend listening on :${PORT}`);
});
