import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    res.status(401).json({ error: "Acesso negado. Token não fornecido." });
    return;
  }

  try {
    const defaultSecret = process.env.JWT_SECRET || 'secret';
    const decoded = jwt.verify(token, defaultSecret) as { id: number; role: string };
    (req as any).user = decoded;
    next();
  } 
  catch (error) {
    res.status(401).json({ error: "Token inválido." });
  }
};
