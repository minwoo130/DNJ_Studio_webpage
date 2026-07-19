import { Router } from "express";
import multer from "multer";
import path from "path";
import crypto from "crypto";
import { pool } from "../db/pool";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

const upload = multer({
  storage: multer.diskStorage({
    destination: path.join(__dirname, "..", "..", "uploads", "products"),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("이미지 파일만 업로드할 수 있습니다."));
    }
    cb(null, true);
  },
});

function toProduct(row: any) {
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    originalPrice: row.original_price ?? undefined,
    badge: row.badge ?? undefined,
    sold: row.sold_label ?? undefined,
    category: row.category,
    tags: row.tags ?? [],
    imageUrl: row.image_url ?? `/products/${row.id}.jpg`,
    detailContent: row.detail_content ?? "",
    isWeeklyBest: row.is_weekly_best,
    isNewArrival: row.is_new_arrival,
  };
}

router.get("/", async (req, res) => {
  const { category, tag, q, section } = req.query;
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (category) {
    params.push(category);
    conditions.push(`category = $${params.length}`);
  }
  if (tag) {
    params.push(tag);
    conditions.push(`$${params.length} = ANY(tags)`);
  }
  if (q) {
    params.push(`%${q}%`);
    conditions.push(
      `(name ILIKE $${params.length} OR EXISTS (SELECT 1 FROM unnest(tags) t WHERE t ILIKE $${params.length}))`
    );
  }
  if (section === "best") {
    conditions.push("is_weekly_best = true");
  }
  if (section === "new") {
    conditions.push("is_new_arrival = true");
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const result = await pool.query(`SELECT * FROM products ${where} ORDER BY id`, params);
  res.json(result.rows.map(toProduct));
});

router.get("/:id", async (req, res) => {
  const result = await pool.query("SELECT * FROM products WHERE id = $1", [req.params.id]);
  if (result.rows.length === 0) {
    return res.status(404).json({ error: "상품을 찾을 수 없습니다." });
  }
  res.json(toProduct(result.rows[0]));
});

router.post("/upload", requireAuth, requireAdmin, upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "이미지 파일이 필요합니다." });
  }
  res.status(201).json({ url: `/uploads/products/${req.file.filename}` });
});

router.post("/", requireAuth, requireAdmin, async (req, res) => {
  const { name, price, originalPrice, badge, sold, category, tags, imageUrl, detailContent, isWeeklyBest, isNewArrival } =
    req.body ?? {};
  if (!name || !price || !category) {
    return res.status(400).json({ error: "name, price, category는 필수입니다." });
  }

  const result = await pool.query(
    `INSERT INTO products (name, price, original_price, badge, sold_label, category, tags, image_url, detail_content, is_weekly_best, is_new_arrival)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [
      name,
      price,
      originalPrice ?? null,
      badge ?? null,
      sold ?? null,
      category,
      tags ?? [],
      imageUrl ?? null,
      typeof detailContent === "string" ? detailContent : "",
      Boolean(isWeeklyBest),
      Boolean(isNewArrival),
    ]
  );
  res.status(201).json(toProduct(result.rows[0]));
});

router.put("/:id", requireAuth, requireAdmin, async (req, res) => {
  const { name, price, originalPrice, badge, sold, category, tags, imageUrl, detailContent, isWeeklyBest, isNewArrival } =
    req.body ?? {};

  const result = await pool.query(
    `UPDATE products
     SET name = COALESCE($1, name),
         price = COALESCE($2, price),
         original_price = COALESCE($3, original_price),
         badge = COALESCE($4, badge),
         sold_label = COALESCE($5, sold_label),
         category = COALESCE($6, category),
         tags = COALESCE($7, tags),
         image_url = COALESCE($8, image_url),
         detail_content = COALESCE($9, detail_content),
         is_weekly_best = COALESCE($10, is_weekly_best),
         is_new_arrival = COALESCE($11, is_new_arrival)
     WHERE id = $12
     RETURNING *`,
    [
      name,
      price,
      originalPrice ?? null,
      badge ?? null,
      sold ?? null,
      category,
      tags,
      imageUrl ?? null,
      typeof detailContent === "string" ? detailContent : null,
      typeof isWeeklyBest === "boolean" ? isWeeklyBest : null,
      typeof isNewArrival === "boolean" ? isNewArrival : null,
      req.params.id,
    ]
  );
  if (result.rows.length === 0) {
    return res.status(404).json({ error: "상품을 찾을 수 없습니다." });
  }
  res.json(toProduct(result.rows[0]));
});

router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  const result = await pool.query("DELETE FROM products WHERE id = $1 RETURNING id", [req.params.id]);
  if (result.rows.length === 0) {
    return res.status(404).json({ error: "상품을 찾을 수 없습니다." });
  }
  res.status(204).send();
});

export default router;
