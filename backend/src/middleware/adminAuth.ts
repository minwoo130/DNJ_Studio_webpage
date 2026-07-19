import { Request, Response, NextFunction } from "express";

// Stopgap shared-secret check until a real admin login/role system exists.
export function requireAdminKey(req: Request, res: Response, next: NextFunction) {
  const key = req.headers["x-admin-key"];
  if (!key || key !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ error: "관리자 인증이 필요합니다." });
  }
  next();
}
