import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { pool } from "../db/pool";

export interface AuthedRequest extends Request {
  userId?: number;
  isAdmin?: boolean;
}

export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "인증이 필요합니다." });
  }
  try {
    const token = header.slice("Bearer ".length);
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number };
    const result = await pool.query("SELECT is_active FROM users WHERE id = $1", [payload.userId]);
    if (!result.rows[0]?.is_active) {
      return res.status(403).json({ error: "탈퇴 처리된 계정입니다." });
    }
    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ error: "유효하지 않은 토큰입니다." });
  }
}

export async function optionalAuth(req: AuthedRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    try {
      const token = header.slice("Bearer ".length);
      const payload = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number };
      const result = await pool.query("SELECT is_active FROM users WHERE id = $1", [payload.userId]);
      if (result.rows[0]?.is_active) {
        req.userId = payload.userId;
      }
    } catch {
      // 토큰이 없거나 유효하지 않아도 비로그인 상태로 계속 진행
    }
  }
  next();
}

export async function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  const result = await pool.query("SELECT is_admin FROM users WHERE id = $1", [req.userId]);
  if (!result.rows[0]?.is_admin) {
    return res.status(403).json({ error: "관리자만 접근할 수 있습니다." });
  }
  req.isAdmin = true;
  next();
}
