import prisma from "../prisma/client";
import { comparePassword, hashPassword } from "../utils/hash";
import jwt from "jsonwebtoken";
import { validatePassword } from "../utils/validatePassword";
import { Role } from "@prisma/client";

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

export const registerService = async (email: string, password: string, role: string, nome: string) => {
  validatePassword(password);
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new Error("Usuário já existe");

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: { nome, email, password: hashedPassword, role: role as Role }
  });

  return { id: user.id, nome: user.nome, email: user.email, role: user.role };
};