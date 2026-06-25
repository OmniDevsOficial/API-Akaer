import prisma from "../prisma/client";
import { comparePassword, hashPassword } from "../utils/hash";
import jwt from "jsonwebtoken";
import { validatePassword } from "../utils/validatePassword";

export const loginService = async (email: string, password: string) => {
  validatePassword(password);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Usuário ou senha incorretos");
  if (!user.ativo) throw new Error("Conta desativada");

  const validPassword = await comparePassword(password, user.password);
  if (!validPassword) throw new Error("Usuário ou senha incorretos");

  const token = jwt.sign(
    { id: user.id, role: user.role, nome: user.nome },
    process.env.JWT_SECRET as string,
    { expiresIn: "1d" }
  );

  return { token };
};
