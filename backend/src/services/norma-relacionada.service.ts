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
    select: { relacionada_codigo: true },
  });

  return registros.map((registro) => registro.relacionada_codigo);
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
