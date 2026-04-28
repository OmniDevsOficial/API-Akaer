import { Request, Response, NextFunction } from "express";

export const roleMiddleware = (requiredRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRole = (req as any).user?.role;

    if (!userRole || !requiredRoles.includes(userRole)) {
      res.status(403).json({ error: "Acesso negado. Você não tem permissão para realizar esta ação." });
      return;
    }
    next();
  };
};
