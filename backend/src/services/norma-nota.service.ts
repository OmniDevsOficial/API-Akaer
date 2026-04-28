import prisma from "../prisma/client";

export interface NormaNotaInput {
    texto: string;
    ordem?: number;
}

// Normaliza entradas de notas: aceita string simples, JSON ou array de objetos/strings
export const parseNormaNotasInput = (input: unknown): NormaNotaInput[] => {
    if (!input && input !== 0) return [];

    // Tenta fazer parse se vier como string
    if (typeof input === "string") {
        const inputStr = input;
        try {
            input = JSON.parse(inputStr);
        } catch {
            const texto = inputStr.trim();
            return texto ? [{ texto, ordem: 0 }] : [];
        }
    }

    if (!Array.isArray(input)) throw new Error("Formato de notas invalido");

    return input
        .map((nota, index): NormaNotaInput | null => {
            if (typeof nota === "string") {
                const texto = nota.trim();
                return texto ? { texto, ordem: index } : null;
            }

            if (nota && typeof nota === "object") {
                const texto = (typeof nota.texto === "string" ? nota.texto : "").trim();
                const ordem = Number.isInteger(nota.ordem) ? nota.ordem : index;
                return texto ? { texto, ordem } : null;
            }

            return null;
        })
        .filter((nota): nota is NormaNotaInput => Boolean(nota));
};

// --- CRUD de notas ---

// Criar uma Nota
export const createNormaNotaService = async (normaCodigo: string, notaInput: NormaNotaInput) => {
    const texto = notaInput.texto?.trim();
    if (!texto) throw new Error("Texto da nota e obrigatorio");

    return prisma.normaNota.create({
        data: {
            norma_codigo: normaCodigo,
            texto,
            ordem: Number.isInteger(notaInput.ordem) ? notaInput.ordem! : 0,
        },
    });
};

// Criar Múltiplas Notas
export const createNormaNotasService = async (normaCodigo: string, notasInput: NormaNotaInput[]) => {
    if (!notasInput.length) return { count: 0 };

    return prisma.normaNota.createMany({
        data: notasInput.map((nota, index) => ({
            norma_codigo: normaCodigo,
            texto: nota.texto,
            ordem: Number.isInteger(nota.ordem) ? nota.ordem! : index,
        })),
    });
};

// Trazer as Notas de uma Norma
export const getNormaNotasService = async (normaCodigo: string) => {
    return prisma.normaNota.findMany({
        where: { norma_codigo: normaCodigo },
        orderBy: { ordem: "asc" },
        select: { id: true, texto: true, ordem: true },
    });
};

// Atualizar as Notas de uma Norma
export const updateNormaNotaService = async (notaId: number, notaInput: Partial<NormaNotaInput>) => {
    if (!Number.isInteger(notaId) || notaId <= 0) throw new Error("Nota invalida");

    const data: { texto?: string; ordem?: number } = {};

    if (notaInput.texto !== undefined) {
        const texto = notaInput.texto.trim();
        if (!texto) throw new Error("Texto da nota e obrigatorio");
        data.texto = texto;
    }

    if (notaInput.ordem !== undefined) {
        data.ordem = Number.isInteger(notaInput.ordem) ? notaInput.ordem : 0;
    }

    if (!Object.keys(data).length) throw new Error("Nenhum campo valido para atualizar");

    return prisma.normaNota.update({ where: { id: notaId }, data });
};

// Deletar uma Nota
export const deleteNormaNotaService = async (notaId: number) => {
    if (!Number.isInteger(notaId) || notaId <= 0) throw new Error("Nota invalida");
    return prisma.normaNota.delete({ where: { id: notaId } });
};

// Substitui todas as notas de uma norma atomicamente
export const replaceNormaNotasService = async (normaCodigo: string, notasInput: NormaNotaInput[]) => {
    const notas = notasInput.map((nota, index) => ({
        norma_codigo: normaCodigo,
        texto: nota.texto,
        ordem: Number.isInteger(nota.ordem) ? nota.ordem! : index,
    }));

    await prisma.$transaction(async (tx) => {
        await tx.normaNota.deleteMany({ where: { norma_codigo: normaCodigo } });
        if (notas.length) await tx.normaNota.createMany({ data: notas });
    });

    return getNormaNotasService(normaCodigo);
};