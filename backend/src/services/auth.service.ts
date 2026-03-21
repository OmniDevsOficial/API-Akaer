import prisma from "../prisma/client";
import { comparePassword } from "../utils/hash";
import jwt from "jsonwebtoken";
import { validatePassword } from "../utils/validatePassword";

export const loginService = async (email: string, password: string) => {
  validatePassword(password);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Usuário não encontrado");

  const validPassword = await comparePassword(password, user.password);
  if (!validPassword) throw new Error("Senha inválida");

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: "1d" }
  );

  return { token };
};