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
    imageUrls: row.image_urls && row.image_urls.length > 0 ? row.image_urls : row.image_url ? [row.image_url] : [],
    detailContent: row.detail_content ?? "",
    detailImages: row.detail_images ?? [],
    isWeeklyBest: row.is_weekly_best,
    isNewArrival: row.is_new_arrival,
    bestOrder: row.best_order ?? undefined,
    newOrder: row.new_order ?? undefined,
    colors: row.colors ?? [],
    sizes: row.sizes ?? [],
    origin: row.origin ?? undefined,
    summary: row.summary ?? undefined,
    heroSlot: row.hero_slot ?? undefined,
  };
}

function parseOptionList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const cleaned = value.map((v) => String(v).trim()).filter((v) => v.length > 0);
  return Array.from(new Set(cleaned));
}

const MAX_THUMBNAIL_IMAGES = 3;

// imageUrls가 요청 본문에 없으면 null(값 유지, PUT에서 COALESCE로 기존 값을 보존하는 데 사용)을
// 반환하고, 3장을 초과하면 "invalid"를 반환해 400 처리한다.
function parseImageUrls(value: unknown): string[] | null | "invalid" {
  if (value === undefined) return null;
  if (!Array.isArray(value)) return "invalid";
  const cleaned = value.map((v) => String(v).trim()).filter((v) => v.length > 0);
  if (cleaned.length > MAX_THUMBNAIL_IMAGES) return "invalid";
  return cleaned;
}

const MAX_RELATED_PRODUCTS = 12;

// relatedProductIds가 요청 본문에 없으면 null(값 유지)을 반환한다. selfId가
// 주어지면 자기 자신 참조는 조용히 걸러낸다(신규 등록 시에는 아직 id가 없어
// 필터링 없이 저장한 뒤 등록 직후 다시 한 번 걸러준다).
function parseRelatedIds(value: unknown, selfId?: number): number[] | null {
  if (value === undefined) return null;
  if (!Array.isArray(value)) return [];
  const ids = value
    .map((v) => Number(v))
    .filter((n) => Number.isInteger(n) && n > 0 && n !== selfId)
    .slice(0, MAX_RELATED_PRODUCTS);
  return Array.from(new Set(ids));
}

// 연관 상품은 거미줄처럼 양방향으로 연결한다: A에서 B를 연관상품으로 지정하면
// B의 상세페이지에도 A가 함께 노출되도록 (A,B), (B,A) 양쪽을 저장한다.
// productId 기준의 기존 연결을 모두 지우고 새로 지정한 목록으로 다시 채운다.
async function syncProductRelations(productId: number, relatedIds: number[]) {
  await pool.query("DELETE FROM product_relations WHERE product_id = $1 OR related_product_id = $1", [productId]);
  for (const relatedId of relatedIds) {
    await pool.query(
      `INSERT INTO product_relations (product_id, related_product_id) VALUES ($1, $2), ($2, $1)
       ON CONFLICT DO NOTHING`,
      [productId, relatedId]
    );
  }
}

async function getRelatedProductIds(productId: number): Promise<number[]> {
  const result = await pool.query(
    "SELECT related_product_id FROM product_relations WHERE product_id = $1 ORDER BY related_product_id",
    [productId]
  );
  return result.rows.map((r) => r.related_product_id);
}

// 목록 조회 시 상품마다 연관상품 id 목록을 한 번의 쿼리로 붙여준다(관리자
// 페이지에서 상품 수정 시 기존 연관상품을 미리 채워 보여주기 위함).
async function attachRelatedIds<T extends { id: number }>(products: T[]): Promise<(T & { relatedProductIds: number[] })[]> {
  if (products.length === 0) return products as (T & { relatedProductIds: number[] })[];
  const result = await pool.query(
    "SELECT product_id, related_product_id FROM product_relations WHERE product_id = ANY($1)",
    [products.map((p) => p.id)]
  );
  const map = new Map<number, number[]>();
  for (const row of result.rows) {
    const list = map.get(row.product_id) ?? [];
    list.push(row.related_product_id);
    map.set(row.product_id, list);
  }
  return products.map((p) => ({ ...p, relatedProductIds: map.get(p.id) ?? [] }));
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
  const { category, tag, q, section, limit, heroSlot } = req.query;
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
  if (heroSlot === "new_arrival" || heroSlot === "best_item") {
    params.push(heroSlot);
    conditions.push(`hero_slot = $${params.length}`);
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
    return res.json(await attachRelatedIds(products));
  }

  let limitClause = "";
  const parsedLimit = Number(limit);
  if (Number.isInteger(parsedLimit) && parsedLimit > 0) {
    params.push(parsedLimit);
    limitClause = ` LIMIT $${params.length}`;
  }

  const result = await pool.query(`SELECT * FROM products ${where} ORDER BY id${limitClause}`, params);
  res.json(await attachRelatedIds(result.rows.map(toProduct)));
});

function parseOrder(value: unknown): number | null | "invalid" {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > 6) return "invalid";
  return n;
}

const HERO_SLOTS = ["new_arrival", "best_item"] as const;
type HeroSlot = (typeof HERO_SLOTS)[number];

// 관리자 폼은 항상 현재 값을 그대로 보내므로 "값 유지" 상태는 두지 않고,
// 비어있으면 연결 해제(null)로 직접 반영한다.
function parseHeroSlot(value: unknown): HeroSlot | null | "invalid" {
  if (value === null || value === undefined || value === "") return null;
  if (HERO_SLOTS.includes(value as HeroSlot)) return value as HeroSlot;
  return "invalid";
}

// 슬롯 하나에는 상품 1개만 연결될 수 있으므로, 새로 지정하기 전에 그 슬롯을
// 갖고 있던 다른 상품의 연결을 자동으로 해제한다("기존 연결고리는 해제").
async function clearOtherHeroSlotHolders(slot: HeroSlot, exceptProductId: number | null) {
  await pool.query(
    `UPDATE products SET hero_slot = NULL WHERE hero_slot = $1 AND id IS DISTINCT FROM $2`,
    [slot, exceptProductId]
  );
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

  const relatedResult = await pool.query(
    `SELECT p.* FROM product_relations r
     JOIN products p ON p.id = r.related_product_id
     WHERE r.product_id = $1
     ORDER BY p.id`,
    [id]
  );
  const relatedProducts = relatedResult.rows.map(toProduct);

  res.json({
    ...toProduct(result.rows[0]),
    relatedProducts,
    relatedProductIds: relatedProducts.map((p) => p.id),
  });
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
    imageUrls,
    detailContent,
    detailImages,
    isWeeklyBest,
    isNewArrival,
    bestOrder,
    newOrder,
    colors,
    sizes,
    origin,
    summary,
    heroSlot,
    relatedProductIds,
  } = req.body ?? {};
  if (!name || !price || !category) {
    return res.status(400).json({ error: "name, price, category는 필수입니다." });
  }

  const parsedBestOrder = parseOrder(bestOrder);
  const parsedNewOrder = parseOrder(newOrder);
  if (parsedBestOrder === "invalid" || parsedNewOrder === "invalid") {
    return res.status(400).json({ error: "노출 순서는 1~6 사이 숫자만 가능합니다." });
  }

  const parsedImageUrls = parseImageUrls(imageUrls);
  if (parsedImageUrls === "invalid") {
    return res.status(400).json({ error: `대표 이미지는 최대 ${MAX_THUMBNAIL_IMAGES}장까지 등록할 수 있습니다.` });
  }
  const parsedHeroSlot = parseHeroSlot(heroSlot);
  if (parsedHeroSlot === "invalid") {
    return res.status(400).json({ error: "히어로 배너 슬롯 값이 올바르지 않습니다." });
  }
  const imageUrlList = parsedImageUrls ?? [];
  const relatedIds = parseRelatedIds(relatedProductIds) ?? [];

  try {
    if (parsedHeroSlot) {
      await clearOtherHeroSlotHolders(parsedHeroSlot, null);
    }
    const result = await pool.query(
      `INSERT INTO products (name, price, original_price, badge, sold_label, category, tags, image_url, image_urls, detail_content, detail_images, is_weekly_best, is_new_arrival, best_order, new_order, colors, sizes, origin, summary, hero_slot)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
       RETURNING *`,
      [
        name,
        price,
        originalPrice ?? null,
        badge ?? null,
        sold ?? null,
        category,
        tags ?? [],
        imageUrlList[0] ?? null,
        imageUrlList,
        typeof detailContent === "string" ? detailContent : "",
        Array.isArray(detailImages) ? detailImages : [],
        Boolean(isWeeklyBest),
        Boolean(isNewArrival),
        parsedBestOrder,
        parsedNewOrder,
        parseOptionList(colors),
        parseOptionList(sizes),
        typeof origin === "string" && origin.trim() ? origin.trim() : null,
        typeof summary === "string" && summary.trim() ? summary.trim() : null,
        parsedHeroSlot,
      ]
    );
    const product = result.rows[0];
    const cleanRelatedIds = relatedIds.filter((relId) => relId !== product.id);
    await syncProductRelations(product.id, cleanRelatedIds);
    res.status(201).json({ ...toProduct(product), relatedProductIds: cleanRelatedIds });
  } catch (err: any) {
    if (err?.code === "23505") {
      return res.status(409).json({ error: "이미 사용 중인 노출 순서입니다." });
    }
    if (err?.code === "23503") {
      return res.status(400).json({ error: "존재하지 않는 상품을 연관상품으로 지정했습니다." });
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
    imageUrls,
    detailContent,
    detailImages,
    isWeeklyBest,
    isNewArrival,
    bestOrder,
    newOrder,
    colors,
    sizes,
    origin,
    summary,
    heroSlot,
    relatedProductIds,
  } = req.body ?? {};

  const id = Number(req.params.id);
  const parsedBestOrder = parseOrder(bestOrder);
  const parsedNewOrder = parseOrder(newOrder);
  if (parsedBestOrder === "invalid" || parsedNewOrder === "invalid") {
    return res.status(400).json({ error: "노출 순서는 1~6 사이 숫자만 가능합니다." });
  }

  const parsedImageUrls = parseImageUrls(imageUrls);
  if (parsedImageUrls === "invalid") {
    return res.status(400).json({ error: `대표 이미지는 최대 ${MAX_THUMBNAIL_IMAGES}장까지 등록할 수 있습니다.` });
  }
  const parsedHeroSlot = parseHeroSlot(heroSlot);
  if (parsedHeroSlot === "invalid") {
    return res.status(400).json({ error: "히어로 배너 슬롯 값이 올바르지 않습니다." });
  }
  const relatedIds = parseRelatedIds(relatedProductIds, id);

  try {
    if (parsedHeroSlot) {
      await clearOtherHeroSlotHolders(parsedHeroSlot, id);
    }
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
           image_urls = COALESCE($9, image_urls),
           detail_content = COALESCE($10, detail_content),
           detail_images = COALESCE($11, detail_images),
           is_weekly_best = COALESCE($12, is_weekly_best),
           is_new_arrival = COALESCE($13, is_new_arrival),
           best_order = $14,
           new_order = $15,
           colors = $16,
           sizes = $17,
           origin = COALESCE($18, origin),
           summary = COALESCE($19, summary),
           hero_slot = $20
       WHERE id = $21
       RETURNING *`,
      [
        name,
        price,
        originalPrice ?? null,
        badge ?? null,
        sold ?? null,
        category,
        tags,
        parsedImageUrls ? parsedImageUrls[0] ?? null : null,
        parsedImageUrls,
        typeof detailContent === "string" ? detailContent : null,
        Array.isArray(detailImages) ? detailImages : null,
        typeof isWeeklyBest === "boolean" ? isWeeklyBest : null,
        typeof isNewArrival === "boolean" ? isNewArrival : null,
        parsedBestOrder,
        parsedNewOrder,
        parseOptionList(colors),
        parseOptionList(sizes),
        typeof origin === "string" ? (origin.trim() || null) : null,
        typeof summary === "string" ? (summary.trim() || null) : null,
        parsedHeroSlot,
        id,
      ]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "상품을 찾을 수 없습니다." });
    }
    if (relatedIds !== null) {
      await syncProductRelations(id, relatedIds);
    }
    res.json({ ...toProduct(result.rows[0]), relatedProductIds: await getRelatedProductIds(id) });
  } catch (err: any) {
    if (err?.code === "23505") {
      return res.status(409).json({ error: "이미 사용 중인 노출 순서입니다." });
    }
    if (err?.code === "23503") {
      return res.status(400).json({ error: "존재하지 않는 상품을 연관상품으로 지정했습니다." });
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
