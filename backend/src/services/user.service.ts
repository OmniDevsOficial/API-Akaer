import prisma from "../prisma/client";

export class UserService {
  async listUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        ativo: true,
        criado_em: true,
      },
    });
  }

  async getUserById(id: number) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        ativo: true,
        criado_em: true,
      },
    });

    if (!user) throw new Error("Usuário não encontrado");
    return user;
  }
}
