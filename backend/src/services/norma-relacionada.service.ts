import prisma from "../prisma/client";

export type NormaRelacionadaId = string;

export const parseNormasRelacionadasInput = (input: unknown): NormaRelacionadaId[] => {
  if (!input && input !== 0) return [];

  if (typeof input === "string") {
    const trimmed = input.trim();
    if (!trimmed) return [];

    try {
      input = JSON.parse(trimmed);
    } catch {
      return [trimmed];
    }
  }

  if (!Array.isArray(input)) {
    throw new Error("Formato de normas_relacionadas_ids invalido");
  }

  return Array.from(
    new Set(
      input
        .map((value) => {
          if (typeof value === "string" || typeof value === "number") {
            return String(value).trim();
          }

          if (value && typeof value === "object") {
            const candidate =
              "codigo" in value && (typeof value.codigo === "string" || typeof value.codigo === "number")
                ? String(value.codigo).trim()
                : "id" in value && (typeof value.id === "string" || typeof value.id === "number")
                  ? String(value.id).trim()
                  : "";

            return candidate;
          }

          return "";
        })
        .filter(Boolean)
    )
  );
};

export const getNormasRelacionadasIdsService = async (normaCodigo: string) => {
  const registros = await prisma.normaRelacionada.findMany({
    where: { norma_codigo: normaCodigo },
    orderBy: { ordem: "asc" },
    select: {
      relacionada_codigo: true,
      relacionada: {
        select: {
          titulo: true
        }
      }
    }
  });

  return registros.map((registro) => ({
    codigo: registro.relacionada_codigo,
    titulo: registro.relacionada?.titulo
  }));
};

export const addNormaRelacionadaService = async (normaCodigo: string, relacionadaCodigo: string) => {
  if (normaCodigo === relacionadaCodigo) {
    throw new Error("Uma norma não pode ser relacionada a si mesma.");
  }

  const normaExistente = await prisma.norma.findUnique({ where: { codigo: normaCodigo } });
  if (!normaExistente) {
    throw new Error(`Norma origem não encontrada: ${normaCodigo}`);
  }

  const relacionadaExistente = await prisma.norma.findUnique({ where: { codigo: relacionadaCodigo } });
  if (!relacionadaExistente) {
    throw new Error(`Norma relacionada não encontrada: ${relacionadaCodigo}`);
  }

  const relacaoExistente = await prisma.normaRelacionada.findUnique({
    where: {
      norma_codigo_relacionada_codigo: {
        norma_codigo: normaCodigo,
        relacionada_codigo: relacionadaCodigo
      }
    }
  });

  if (relacaoExistente) {
    throw new Error("Essa correlação já existe.");
  }

  const ultimaRelacao = await prisma.normaRelacionada.findFirst({
    where: { norma_codigo: normaCodigo },
    orderBy: { ordem: "desc" }
  });

  const novaOrdem = ultimaRelacao ? ultimaRelacao.ordem + 1 : 0;

  await prisma.normaRelacionada.create({
    data: {
      norma_codigo: normaCodigo,
      relacionada_codigo: relacionadaCodigo,
      ordem: novaOrdem
    }
  });

  return getNormasRelacionadasIdsService(normaCodigo);
};

export const removeNormaRelacionadaService = async (normaCodigo: string, relacionadaCodigo: string) => {
  const relacaoExistente = await prisma.normaRelacionada.findUnique({
    where: {
      norma_codigo_relacionada_codigo: {
        norma_codigo: normaCodigo,
        relacionada_codigo: relacionadaCodigo
      }
    }
  });

  if (!relacaoExistente) {
    throw new Error("Essa correlação não existe.");
  }

  await prisma.normaRelacionada.delete({
    where: {
      norma_codigo_relacionada_codigo: {
        norma_codigo: normaCodigo,
        relacionada_codigo: relacionadaCodigo
      }
    }
  });

  return getNormasRelacionadasIdsService(normaCodigo);
};

export const replaceNormasRelacionadasService = async (
  normaCodigo: string,
  relacionadasIds: NormaRelacionadaId[]
) => {
  const relacionadas = relacionadasIds
    .filter((relacionadaCodigo) => relacionadaCodigo !== normaCodigo)
    .map((relacionadaCodigo, index) => ({
      norma_codigo: normaCodigo,
      relacionada_codigo: relacionadaCodigo,
      ordem: index,
    }));

  if (relacionadas.length) {
    const normasExistentes = await prisma.norma.findMany({
      where: { codigo: { in: relacionadas.map((item) => item.relacionada_codigo) } },
      select: { codigo: true },
    });

    const codigosExistentes = new Set(normasExistentes.map((norma) => norma.codigo));
    const codigosInvalidos = relacionadas
      .map((item) => item.relacionada_codigo)
      .filter((codigo) => !codigosExistentes.has(codigo));

    if (codigosInvalidos.length) {
      throw new Error(`Normas relacionadas nao encontradas: ${codigosInvalidos.join(", ")}`);
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.normaRelacionada.deleteMany({ where: { norma_codigo: normaCodigo } });

    if (relacionadas.length) {
      await tx.normaRelacionada.createMany({ data: relacionadas });
    }
  });

  return getNormasRelacionadasIdsService(normaCodigo);
};
