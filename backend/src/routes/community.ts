import { Router } from "express";
import multer from "multer";
import path from "path";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { pool } from "../db/pool";
import { requireAuth, optionalAuth, type AuthedRequest } from "../middleware/auth";

const router = Router({ mergeParams: true });

const MAX_IMAGES = 5;

const upload = multer({
  storage: multer.diskStorage({
    destination: path.join(__dirname, "..", "..", "uploads", "reviews"),
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

const BOARD_TYPES = ["notice", "review", "qna", "exchange"] as const;
type BoardType = (typeof BOARD_TYPES)[number];

// QnA는 문의 내용에 개인정보가 섞이기 쉬워 항상 비밀글로 강제한다
// (작성자·관리자만 열람/댓글 가능하며, 댓글도 비밀글 게이트를 그대로 상속받는다).
const FORCE_PRIVATE_BOARD_TYPES: BoardType[] = ["qna"];

// 반품/교환은 공지사항처럼 관리자만 작성하는 공지성 게시판으로 운영한다:
// 항상 전체 공개(비밀글 불가)이고 댓글도 달 수 없다.
const NOTICE_LIKE_BOARD_TYPES: BoardType[] = ["notice", "exchange"];

function isBoardType(value: string): value is BoardType {
  return (BOARD_TYPES as readonly string[]).includes(value);
}

function sanitizeImageUrls(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string" && v.length > 0).slice(0, MAX_IMAGES);
}

async function isAdminUser(userId?: number) {
  if (!userId) return false;
  const result = await pool.query("SELECT is_admin FROM users WHERE id = $1", [userId]);
  return Boolean(result.rows[0]?.is_admin);
}

router.param("boardType", (req, res, next, boardType) => {
  if (!isBoardType(boardType)) {
    return res.status(404).json({ error: "존재하지 않는 게시판입니다." });
  }
  next();
});

function toListItem(row: any, viewerId?: number, viewerIsAdmin?: boolean) {
  const canSeeContent = !row.is_private || row.user_id === viewerId || viewerIsAdmin;
  // QnA는 문의 제목에도 개인정보(주문/상품 관련 문의 내용)가 드러나는 경우가 많아
  // 목록에서 제목 자체를 가려서 "비밀글입니다"로 노출한다.
  const hideTitle = row.board_type === "qna" && !canSeeContent;
  return {
    id: row.id,
    title: hideTitle ? "비밀글입니다" : row.title,
    content: canSeeContent ? row.content : undefined,
    authorName: row.author_name,
    authorIsAdmin: row.author_is_admin,
    isPrivate: row.is_private,
    viewCount: row.view_count,
    commentCount: Number(row.comment_count ?? 0),
    productId: row.product_id ?? undefined,
    productName: row.product_name ?? undefined,
    productImageUrl: row.product_id ? row.product_image_url ?? `/products/${row.product_id}.jpg` : undefined,
    rating: row.rating ?? undefined,
    imageUrls: canSeeContent ? row.image_urls ?? [] : [],
    createdAt: row.created_at,
  };
}

function toDetail(post: any, comments: any[], req: AuthedRequest, isOwner: boolean) {
  return {
    id: post.id,
    boardType: post.board_type,
    title: post.title,
    content: post.content,
    authorName: post.author_name,
    authorId: post.user_id,
    authorIsAdmin: post.author_is_admin,
    isPrivate: post.is_private,
    viewCount: post.view_count,
    productId: post.product_id ?? undefined,
    productName: post.product_name ?? undefined,
    rating: post.rating ?? undefined,
    imageUrls: post.image_urls ?? [],
    createdAt: post.created_at,
    updatedAt: post.updated_at,
    isOwner,
    comments: comments.map((c) => ({
      id: c.id,
      content: c.content,
      authorName: c.author_name,
      authorId: c.user_id,
      authorIsAdmin: c.author_is_admin,
      createdAt: c.created_at,
      isOwner: req.userId === c.user_id,
    })),
  };
}

router.get("/:boardType", optionalAuth, async (req: AuthedRequest, res) => {
  const boardType = req.params.boardType as BoardType;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
  const offset = (page - 1) * limit;
  const productId = req.query.productId ? Number(req.query.productId) : undefined;

  const viewerIsAdmin = await isAdminUser(req.userId);

  const conditions = ["cp.board_type = $1"];
  const params: unknown[] = [boardType];
  if (productId) {
    params.push(productId);
    conditions.push(`cp.product_id = $${params.length}`);
  }
  const where = conditions.join(" AND ");

  const [rows, countResult] = await Promise.all([
    pool.query(
      `SELECT cp.*, u.name AS author_name, u.is_admin AS author_is_admin, p.name AS product_name, p.image_url AS product_image_url,
              (SELECT COUNT(*) FROM community_comments cc WHERE cc.post_id = cp.id) AS comment_count
       FROM community_posts cp
       JOIN users u ON u.id = cp.user_id
       LEFT JOIN products p ON p.id = cp.product_id
       WHERE ${where}
       ORDER BY cp.id DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    ),
    pool.query(`SELECT COUNT(*) FROM community_posts cp WHERE ${where}`, params),
  ]);

  res.json({
    posts: rows.rows.map((row) => toListItem(row, req.userId, viewerIsAdmin)),
    total: Number(countResult.rows[0].count),
    page,
    limit,
  });
});

router.get("/:boardType/:id", optionalAuth, async (req: AuthedRequest, res) => {
  const boardType = req.params.boardType as BoardType;

  const result = await pool.query(
    `SELECT cp.*, u.name AS author_name, u.is_admin AS author_is_admin, p.name AS product_name
     FROM community_posts cp
     JOIN users u ON u.id = cp.user_id
     LEFT JOIN products p ON p.id = cp.product_id
     WHERE cp.id = $1 AND cp.board_type = $2`,
    [req.params.id, boardType]
  );
  if (result.rows.length === 0) {
    return res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
  }
  const post = result.rows[0];
  const viewerIsAdmin = await isAdminUser(req.userId);
  const isOwner = req.userId === post.user_id;

  if (post.is_private && !isOwner && !viewerIsAdmin) {
    return res.status(403).json({
      error: "비밀글입니다. 비밀번호를 입력하면 볼 수 있어요.",
      isPrivate: true,
      hasPassword: Boolean(post.password_hash),
      title: "비밀글입니다",
    });
  }

  await pool.query("UPDATE community_posts SET view_count = view_count + 1 WHERE id = $1", [post.id]);
  post.view_count += 1;

  const comments = await pool.query(
    `SELECT cc.*, u.name AS author_name, u.is_admin AS author_is_admin
     FROM community_comments cc
     JOIN users u ON u.id = cc.user_id
     WHERE cc.post_id = $1
     ORDER BY cc.id ASC`,
    [post.id]
  );

  res.json(toDetail(post, comments.rows, req, isOwner));
});

router.post("/:boardType/:id/unlock", optionalAuth, async (req: AuthedRequest, res) => {
  const boardType = req.params.boardType as BoardType;
  const { password } = req.body ?? {};

  const result = await pool.query(
    `SELECT cp.*, u.name AS author_name, u.is_admin AS author_is_admin, p.name AS product_name
     FROM community_posts cp
     JOIN users u ON u.id = cp.user_id
     LEFT JOIN products p ON p.id = cp.product_id
     WHERE cp.id = $1 AND cp.board_type = $2`,
    [req.params.id, boardType]
  );
  if (result.rows.length === 0) {
    return res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
  }
  const post = result.rows[0];

  if (!post.password_hash || !password || !(await bcrypt.compare(String(password), post.password_hash))) {
    return res.status(403).json({ error: "비밀번호가 일치하지 않습니다." });
  }

  await pool.query("UPDATE community_posts SET view_count = view_count + 1 WHERE id = $1", [post.id]);
  post.view_count += 1;

  const comments = await pool.query(
    `SELECT cc.*, u.name AS author_name, u.is_admin AS author_is_admin
     FROM community_comments cc
     JOIN users u ON u.id = cc.user_id
     WHERE cc.post_id = $1
     ORDER BY cc.id ASC`,
    [post.id]
  );

  const isOwner = req.userId === post.user_id;
  res.json(toDetail(post, comments.rows, req, isOwner));
});

router.post("/upload", requireAuth, upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "이미지 파일이 필요합니다." });
  }
  res.status(201).json({ url: `/uploads/reviews/${req.file.filename}` });
});

router.post("/:boardType", requireAuth, async (req: AuthedRequest, res) => {
  const boardType = req.params.boardType as BoardType;
  const { title, content, isPrivate, productId, rating, imageUrls, password } = req.body ?? {};

  if (!title?.trim() || !content?.trim()) {
    return res.status(400).json({ error: "제목과 내용은 필수입니다." });
  }

  if (NOTICE_LIKE_BOARD_TYPES.includes(boardType) && !(await isAdminUser(req.userId))) {
    return res.status(403).json({ error: "공지사항/반품교환은 관리자만 작성할 수 있습니다." });
  }

  if (boardType === "review") {
    if (rating !== undefined && rating !== null) {
      const ratingNum = Number(rating);
      if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        return res.status(400).json({ error: "별점은 1~5 사이의 정수여야 합니다." });
      }
    }

    if (!(await isAdminUser(req.userId))) {
      if (!productId) {
        return res.status(400).json({ error: "리뷰를 작성할 상품이 지정되지 않았습니다." });
      }
      const purchased = await pool.query(
        `SELECT 1 FROM order_items oi
         JOIN orders o ON o.id = oi.order_id
         WHERE o.user_id = $1 AND oi.product_id = $2
         LIMIT 1`,
        [req.userId, Number(productId)]
      );
      if (purchased.rows.length === 0) {
        return res.status(403).json({ error: "구매한 상품만 리뷰를 작성할 수 있습니다." });
      }
    }
  }

  const isPrivateFinal = NOTICE_LIKE_BOARD_TYPES.includes(boardType)
    ? false
    : FORCE_PRIVATE_BOARD_TYPES.includes(boardType)
      ? true
      : Boolean(isPrivate);
  if (isPrivateFinal && !password?.trim()) {
    return res.status(400).json({ error: "비밀글은 비밀번호를 입력해야 합니다." });
  }
  const passwordHash = isPrivateFinal ? await bcrypt.hash(String(password).trim(), 10) : null;

  const result = await pool.query(
    `INSERT INTO community_posts (board_type, user_id, title, content, is_private, product_id, rating, image_urls, password_hash)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id`,
    [
      boardType,
      req.userId,
      title.trim(),
      content.trim(),
      isPrivateFinal,
      boardType === "review" && productId ? Number(productId) : null,
      boardType === "review" && rating ? Number(rating) : null,
      sanitizeImageUrls(imageUrls),
      passwordHash,
    ]
  );
  res.status(201).json({ id: result.rows[0].id });
});

router.put("/:boardType/:id", requireAuth, async (req: AuthedRequest, res) => {
  const boardType = req.params.boardType as BoardType;
  const { title, content, isPrivate, rating, imageUrls, password } = req.body ?? {};

  const existing = await pool.query(
    "SELECT user_id, password_hash FROM community_posts WHERE id = $1 AND board_type = $2",
    [req.params.id, boardType]
  );
  if (existing.rows.length === 0) {
    return res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
  }
  const isOwner = existing.rows[0].user_id === req.userId;
  if (!isOwner && !(await isAdminUser(req.userId))) {
    return res.status(403).json({ error: "작성자 또는 관리자만 수정할 수 있습니다." });
  }

  if (boardType === "review" && rating !== undefined && rating !== null) {
    const ratingNum = Number(rating);
    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ error: "별점은 1~5 사이의 정수여야 합니다." });
    }
  }

  const isPrivateFinal = NOTICE_LIKE_BOARD_TYPES.includes(boardType)
    ? false
    : FORCE_PRIVATE_BOARD_TYPES.includes(boardType)
      ? true
      : typeof isPrivate === "boolean"
        ? isPrivate
        : null;
  // 이미 비밀글(기존 비밀번호 보유)이면 수정 시 비밀번호를 다시 입력하지 않아도 기존 비밀번호를 유지한다.
  if (isPrivateFinal === true && !existing.rows[0].password_hash && !password?.trim()) {
    return res.status(400).json({ error: "비밀글은 비밀번호를 입력해야 합니다." });
  }
  const passwordHash = password?.trim() ? await bcrypt.hash(String(password).trim(), 10) : null;

  const result = await pool.query(
    `UPDATE community_posts
     SET title = COALESCE($1, title),
         content = COALESCE($2, content),
         is_private = COALESCE($3, is_private),
         rating = CASE WHEN $5::boolean THEN COALESCE($4, rating) ELSE rating END,
         image_urls = COALESCE($7, image_urls),
         password_hash = COALESCE($8, password_hash),
         updated_at = now()
     WHERE id = $6
     RETURNING id`,
    [
      title?.trim(),
      content?.trim(),
      isPrivateFinal,
      rating ? Number(rating) : null,
      boardType === "review",
      req.params.id,
      Array.isArray(imageUrls) ? sanitizeImageUrls(imageUrls) : null,
      passwordHash,
    ]
  );
  res.json({ id: result.rows[0].id });
});

router.delete("/:boardType/:id", requireAuth, async (req: AuthedRequest, res) => {
  const boardType = req.params.boardType as BoardType;

  const existing = await pool.query(
    "SELECT user_id FROM community_posts WHERE id = $1 AND board_type = $2",
    [req.params.id, boardType]
  );
  if (existing.rows.length === 0) {
    return res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
  }
  const isOwner = existing.rows[0].user_id === req.userId;
  if (!isOwner && !(await isAdminUser(req.userId))) {
    return res.status(403).json({ error: "작성자 또는 관리자만 삭제할 수 있습니다." });
  }

  await pool.query("DELETE FROM community_posts WHERE id = $1", [req.params.id]);
  res.status(204).send();
});

router.post("/:boardType/:id/comments", requireAuth, async (req: AuthedRequest, res) => {
  const boardType = req.params.boardType as BoardType;
  if (NOTICE_LIKE_BOARD_TYPES.includes(boardType)) {
    return res.status(403).json({ error: "공지사항/반품교환에는 댓글을 작성할 수 없습니다." });
  }
  const { content } = req.body ?? {};
  if (!content?.trim()) {
    return res.status(400).json({ error: "댓글 내용은 필수입니다." });
  }

  const post = await pool.query(
    "SELECT id, user_id, is_private FROM community_posts WHERE id = $1 AND board_type = $2",
    [req.params.id, boardType]
  );
  if (post.rows.length === 0) {
    return res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
  }
  const row = post.rows[0];
  const isOwner = row.user_id === req.userId;
  if (row.is_private && !isOwner && !(await isAdminUser(req.userId))) {
    return res.status(403).json({ error: "비밀글입니다. 작성자와 관리자만 댓글을 남길 수 있습니다." });
  }

  const result = await pool.query(
    `INSERT INTO community_comments (post_id, user_id, content) VALUES ($1, $2, $3) RETURNING id`,
    [row.id, req.userId, content.trim()]
  );
  res.status(201).json({ id: result.rows[0].id });
});

router.delete("/:boardType/:id/comments/:commentId", requireAuth, async (req: AuthedRequest, res) => {
  const existing = await pool.query("SELECT user_id FROM community_comments WHERE id = $1 AND post_id = $2", [
    req.params.commentId,
    req.params.id,
  ]);
  if (existing.rows.length === 0) {
    return res.status(404).json({ error: "댓글을 찾을 수 없습니다." });
  }
  const isOwner = existing.rows[0].user_id === req.userId;
  if (!isOwner && !(await isAdminUser(req.userId))) {
    return res.status(403).json({ error: "작성자 또는 관리자만 삭제할 수 있습니다." });
  }

  await pool.query("DELETE FROM community_comments WHERE id = $1", [req.params.commentId]);
  res.status(204).send();
});

export default router;
