import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthedRequest extends Request {
  userId?: number;
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "인증이 필요합니다." });
  }
  try {
    const token = header.slice("Bearer ".length);
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number };
    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ error: "유효하지 않은 토큰입니다." });
  }
}
