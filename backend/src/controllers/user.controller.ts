import { Request, Response } from "express";
import { UserService } from "../services/user.service";

const userService = new UserService();

export class UserController {
  async listUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await userService.listUsers();
      res.json(users);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getUserProfile(req: Request, res: Response): Promise<void> {
    try {
      const targetId = parseInt(req.params.id as string, 10);
      
      if (isNaN(targetId)) {
        res.status(400).json({ error: "ID de usuário inválido." });
        return;
      }

      const userReq = (req as any).user;

      if (userReq.role !== "ADMIN" && userReq.id !== targetId) {
        res.status(403).json({ error: "Acesso negado." });
        return;
      }

      const user = await userService.getUserById(targetId);
      res.json(user);
    } catch (error: any) {
      if (error.message === "Usuário não encontrado") {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: "Erro ao buscar usuário" });
    }
  }
}
