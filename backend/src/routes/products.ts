import { Router } from "express";
import multer from "multer";
import path from "path";
import crypto from "crypto";
import { pool } from "../db/pool";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

const MAX_IMAGE_SIZE = 15 * 1024 * 1024;

const upload = multer({
  storage: multer.diskStorage({
    destination: path.join(__dirname, "..", "..", "uploads", "products"),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`);
    },
  }),
  limits: { fileSize: MAX_IMAGE_SIZE },
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
    detailImages: row.detail_images ?? [],
    isWeeklyBest: row.is_weekly_best,
    isNewArrival: row.is_new_arrival,
    bestOrder: row.best_order ?? undefined,
    newOrder: row.new_order ?? undefined,
  };
}

const ORDER_SLOT_COUNT = 6;

// 명시적으로 순서(1~N)가 지정된 상품은 그 자리(슬롯)에 고정하고, 순서가 없는
// 상품은 남은 빈 슬롯을 id 오름차순으로 채운다. 슬롯을 다 채우고 남은 상품은
// 뒤에 이어붙여서(전체 목록/더보기용) 반환한다.
function arrangeBySlot<T extends { id: number }>(
  products: T[],
  orderKey: "bestOrder" | "newOrder",
  slotCount: number
): T[] {
  const slots: (T | null)[] = new Array(slotCount).fill(null);
  const unordered: T[] = [];

  for (const p of products) {
    const order = (p as any)[orderKey] as number | undefined;
    if (order != null && order >= 1 && order <= slotCount && slots[order - 1] === null) {
      slots[order - 1] = p;
    } else {
      unordered.push(p);
    }
  }

  let cursor = 0;
  for (let i = 0; i < slotCount; i++) {
    if (slots[i] === null && cursor < unordered.length) {
      slots[i] = unordered[cursor++];
    }
  }

  const arranged = slots.filter((p): p is T => p !== null);
  const rest = unordered.slice(cursor);
  return [...arranged, ...rest];
}

router.get("/", async (req, res) => {
  const { category, tag, q, section, limit } = req.query;
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

  if (section === "best" || section === "new") {
    const result = await pool.query(`SELECT * FROM products ${where} ORDER BY id`, params);
    let products = result.rows.map(toProduct);
    products = arrangeBySlot(products, section === "best" ? "bestOrder" : "newOrder", ORDER_SLOT_COUNT);

    const parsedLimit = Number(limit);
    if (Number.isInteger(parsedLimit) && parsedLimit > 0) {
      products = products.slice(0, parsedLimit);
    }
    return res.json(products);
  }

  let limitClause = "";
  const parsedLimit = Number(limit);
  if (Number.isInteger(parsedLimit) && parsedLimit > 0) {
    params.push(parsedLimit);
    limitClause = ` LIMIT $${params.length}`;
  }

  const result = await pool.query(`SELECT * FROM products ${where} ORDER BY id${limitClause}`, params);
  res.json(result.rows.map(toProduct));
});

function parseOrder(value: unknown): number | null | "invalid" {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > 6) return "invalid";
  return n;
}

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(404).json({ error: "상품을 찾을 수 없습니다." });
  }
  const result = await pool.query("SELECT * FROM products WHERE id = $1", [id]);
  if (result.rows.length === 0) {
    return res.status(404).json({ error: "상품을 찾을 수 없습니다." });
  }
  res.json(toProduct(result.rows[0]));
});

router.post("/upload", requireAuth, requireAdmin, (req, res) => {
  upload.single("image")(req, res, (err) => {
    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "이미지 용량은 15MB 이하만 업로드할 수 있습니다." });
    }
    if (err) {
      return res.status(400).json({ error: err.message || "이미지 업로드에 실패했습니다." });
    }
    if (!req.file) {
      return res.status(400).json({ error: "이미지 파일이 필요합니다." });
    }
    res.status(201).json({ url: `/uploads/products/${req.file.filename}` });
  });
});

router.post("/", requireAuth, requireAdmin, async (req, res) => {
  const {
    name,
    price,
    originalPrice,
    badge,
    sold,
    category,
    tags,
    imageUrl,
    detailContent,
    detailImages,
    isWeeklyBest,
    isNewArrival,
    bestOrder,
    newOrder,
  } = req.body ?? {};
  if (!name || !price || !category) {
    return res.status(400).json({ error: "name, price, category는 필수입니다." });
  }

  const parsedBestOrder = parseOrder(bestOrder);
  const parsedNewOrder = parseOrder(newOrder);
  if (parsedBestOrder === "invalid" || parsedNewOrder === "invalid") {
    return res.status(400).json({ error: "노출 순서는 1~6 사이 숫자만 가능합니다." });
  }

  try {
    const result = await pool.query(
      `INSERT INTO products (name, price, original_price, badge, sold_label, category, tags, image_url, detail_content, detail_images, is_weekly_best, is_new_arrival, best_order, new_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
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
        Array.isArray(detailImages) ? detailImages : [],
        Boolean(isWeeklyBest),
        Boolean(isNewArrival),
        parsedBestOrder,
        parsedNewOrder,
      ]
    );
    res.status(201).json(toProduct(result.rows[0]));
  } catch (err: any) {
    if (err?.code === "23505") {
      return res.status(409).json({ error: "이미 사용 중인 노출 순서입니다." });
    }
    console.error(err);
    res.status(500).json({ error: "상품 등록 중 오류가 발생했습니다." });
  }
});

router.put("/:id", requireAuth, requireAdmin, async (req, res) => {
  const {
    name,
    price,
    originalPrice,
    badge,
    sold,
    category,
    tags,
    imageUrl,
    detailContent,
    detailImages,
    isWeeklyBest,
    isNewArrival,
    bestOrder,
    newOrder,
  } = req.body ?? {};

  const parsedBestOrder = parseOrder(bestOrder);
  const parsedNewOrder = parseOrder(newOrder);
  if (parsedBestOrder === "invalid" || parsedNewOrder === "invalid") {
    return res.status(400).json({ error: "노출 순서는 1~6 사이 숫자만 가능합니다." });
  }

  try {
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
           detail_images = COALESCE($10, detail_images),
           is_weekly_best = COALESCE($11, is_weekly_best),
           is_new_arrival = COALESCE($12, is_new_arrival),
           best_order = $13,
           new_order = $14
       WHERE id = $15
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
        Array.isArray(detailImages) ? detailImages : null,
        typeof isWeeklyBest === "boolean" ? isWeeklyBest : null,
        typeof isNewArrival === "boolean" ? isNewArrival : null,
        parsedBestOrder,
        parsedNewOrder,
        req.params.id,
      ]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "상품을 찾을 수 없습니다." });
    }
    res.json(toProduct(result.rows[0]));
  } catch (err: any) {
    if (err?.code === "23505") {
      return res.status(409).json({ error: "이미 사용 중인 노출 순서입니다." });
    }
    console.error(err);
    res.status(500).json({ error: "상품 수정 중 오류가 발생했습니다." });
  }
});

router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  const result = await pool.query("DELETE FROM products WHERE id = $1 RETURNING id", [req.params.id]);
  if (result.rows.length === 0) {
    return res.status(404).json({ error: "상품을 찾을 수 없습니다." });
  }
  res.status(204).send();
});

export default router;
