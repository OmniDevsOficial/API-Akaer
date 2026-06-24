/// <reference types="node" />
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import { hashPassword } from "../../src/utils/hash";

const prisma = new PrismaClient();

async function main() {
  const importsDir = './prisma/imports';
  let backupFileName: string | null = null;

  if (fs.existsSync(importsDir)) {
    const files = fs.readdirSync(importsDir);
    const jsonFiles = files.filter(file => file.endsWith('.json')); 

    if (jsonFiles.length > 0) {
      backupFileName = jsonFiles.sort().reverse()[0];
    }
  }

  if (!backupFileName) {
    console.log('Nenhum arquivo de backup (.json) encontrado na pasta imports. Inserindo apenas os dados vitais...');
    
    const hashedPassword1 = await hashPassword('admin123');
    const hashedPassword2 = await hashPassword('viewer123');
    const hashedPassword3 = await hashPassword('checker123');

    await prisma.user.upsert({
      where: { email: 'admin1@gmail.com' },
      update: {},
      create: { nome: 'Administrador', email: 'admin1@gmail.com', password: hashedPassword1, role: 'ADMIN', cargo: "Engenheiro" },
    });
    
    await prisma.user.upsert({
      where: { email: 'viewer1@gmail.com' },
      update: {},
      create: { nome: 'Visualizador', email: 'viewer1@gmail.com', password: hashedPassword2, role: 'VISUALIZADOR', cargo: "Engenheiro" },
    });

    await prisma.user.upsert({
      where: { email: 'checker1@gmail.com' },
      update: {},
      create: { nome: 'Verificador', email: 'checker1@gmail.com', password: hashedPassword3, role: 'CHECKER', cargo: "Engenheiro" },
    });

    // 1. Criar Categorias Hierárquicas
    const categoriasTaxonomia = [
      // Nível 1 (raízes)
      { id: 1, parent_id: null, nome: 'Peça', nivel: 1, ordem: 1 },
      { id: 2, parent_id: null, nome: 'Conjunto', nivel: 1, ordem: 2 },
      { id: 3, parent_id: null, nome: 'Instalação', nivel: 1, ordem: 3 },
      { id: 4, parent_id: null, nome: 'Geral', nivel: 1, ordem: 4 },
      // Nível 2 — Peça
      { id: 5, parent_id: 1, nome: 'Metálica', nivel: 2, ordem: 1 },
      { id: 6, parent_id: 1, nome: 'Não Metálica', nivel: 2, ordem: 2 },
      // Nível 3 — Metálica
      { id: 10, parent_id: 5, nome: 'Tubo', nivel: 3, ordem: 1 },
      { id: 11, parent_id: 5, nome: 'Usinado', nivel: 3, ordem: 2 },
      { id: 12, parent_id: 5, nome: 'Chapa', nivel: 3, ordem: 3 },
      { id: 13, parent_id: 5, nome: 'Extrudado', nivel: 3, ordem: 4 },
      { id: 14, parent_id: 5, nome: 'Fundido', nivel: 3, ordem: 5 },
      { id: 15, parent_id: 5, nome: 'Tratamento Superficial', nivel: 3, ordem: 6 },
      { id: 16, parent_id: 5, nome: 'Teste', nivel: 3, ordem: 7 },
      // Nível 2 — Conjunto
      { id: 7, parent_id: 2, nome: 'Instalação de Acessórios', nivel: 2, ordem: 1 },
      { id: 8, parent_id: 2, nome: 'União de Peças', nivel: 2, ordem: 2 },
      { id: 9, parent_id: 2, nome: 'Cablagem', nivel: 2, ordem: 3 },
      // Nível 3 — Conjunto
      { id: 20, parent_id: 7, nome: 'Tubo com Acessório', nivel: 3, ordem: 1 },
      { id: 21, parent_id: 8, nome: 'Soldagem', nivel: 3, ordem: 1 },
      { id: 22, parent_id: 9, nome: 'Proteção', nivel: 3, ordem: 1 },
      { id: 23, parent_id: 9, nome: 'Bota', nivel: 3, ordem: 2 },
      { id: 24, parent_id: 9, nome: 'Conector', nivel: 3, ordem: 3 },
      // Nível 2 — Instalação
      { id: 30, parent_id: 3, nome: 'Estrutura', nivel: 2, ordem: 1 },
      { id: 31, parent_id: 3, nome: 'Hidromecânicos', nivel: 2, ordem: 2 },
      { id: 32, parent_id: 3, nome: 'Elétrica', nivel: 2, ordem: 3 },
      { id: 33, parent_id: 3, nome: 'Geral', nivel: 2, ordem: 4 },
      { id: 34, parent_id: 3, nome: 'Teste', nivel: 2, ordem: 5 },
      // Nível 3 — Instalação > Geral
      { id: 40, parent_id: 33, nome: 'Selante', nivel: 3, ordem: 1 },
      { id: 41, parent_id: 33, nome: 'Metalização', nivel: 3, ordem: 2 },
      { id: 42, parent_id: 33, nome: 'Rebite', nivel: 3, ordem: 3 },
      { id: 43, parent_id: 33, nome: 'Parafuso', nivel: 3, ordem: 4 },
      { id: 44, parent_id: 33, nome: 'Arruela', nivel: 3, ordem: 5 },
      { id: 45, parent_id: 33, nome: 'Inserto', nivel: 3, ordem: 6 },
      { id: 46, parent_id: 33, nome: 'Frenagem', nivel: 3, ordem: 7 },
      { id: 47, parent_id: 33, nome: 'Shim', nivel: 3, ordem: 8 },
      { id: 48, parent_id: 33, nome: 'Primer', nivel: 3, ordem: 9 },
      // Nível 2 — Geral
      { id: 50, parent_id: 4, nome: 'Basic Notes', nivel: 2, ordem: 1 },
      { id: 51, parent_id: 4, nome: 'Identificação', nivel: 2, ordem: 2 },
    ];

    for (const cat of categoriasTaxonomia) {
      await prisma.categoria.upsert({
        where: { id: cat.id },
        update: cat,
        create: cat,
      });
    }

    // 2. Criar Órgãos Emissores
    const orgaos = ['ANAC', 'EASA', 'FAA'];
    for (const nome of orgaos) {
      await prisma.orgaoEmissor.upsert({
        where: { nome: nome },
        update: {},
        create: { nome: nome },
      });
    }

    // 3. Criar Etapas do Projeto
    const etapas = ['Montagem', 'Testes', 'Selagem'];
    for (const nome of etapas) {
      await prisma.etapaProjeto.upsert({
        where: { nome: nome },
        update: {},
        create: { nome: nome },
      });
    }
    return;
  }

  console.log(`Arquivo de backup detectado: ${backupFileName}. Iniciando Importação...`);
  const rawData = fs.readFileSync(`${importsDir}/${backupFileName}`, 'utf-8');
  const bancoCompleto = JSON.parse(rawData);


  await prisma.$transaction(async (tx) => {

    await tx.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0;');

    try {
      for (const model of Object.keys(bancoCompleto)) {
        const registros = bancoCompleto[model];

        if (!registros || registros.length === 0) continue;

        const modelDelegate = model.charAt(0).toLowerCase() + model.slice(1);

        const insercao = await (tx as any)[modelDelegate].createMany({
          data: registros,
          skipDuplicates: true,
        });

        console.log(`Injetados ${insercao.count} registros na tabela ${model}.`);
      }
    } finally {
      await tx.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1;');
    }
  });

  console.log('Restauração completa e automática!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });