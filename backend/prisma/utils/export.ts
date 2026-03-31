/// <reference types="node" />
import { PrismaClient, Prisma } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function exportAllData() {
  console.log('Iniciando exportação geral...');

  // 1. Acessa os metadados do Prisma para listar todos os Models (Tabelas)
  const models = Prisma.dmmf.datamodel.models.map(model => model.name);

  const bancoCompleto: Record<string, any[]> = {};

  // 2. Itera sobre as tabelas, armazenando-as em 'bancoCompleto'
  for (const model of models) {

    const modelDelegate = model.charAt(0).toLowerCase() + model.slice(1);

    console.log(`Lendo tabela: ${model}...`);

    bancoCompleto[model] = await (prisma as any)[modelDelegate].findMany();
  }

  const date = new Date();
  const formatedDate = date.toLocaleDateString('pt-BR').replace(/\//g, '');
  const formatedTime = date.toLocaleTimeString('pt-BR').replace(/:/g, '');

  // Garante que a pasta imports exista antes de tentar salvar nela
  const dirPath = './prisma/exports';
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const fileName = `aker_db_${formatedDate}_${formatedTime}.json`;
  const fullPath = `${dirPath}/${fileName}`;

  // Salva o arquivo na pasta correta
  fs.writeFileSync(fullPath, JSON.stringify(bancoCompleto, null, 2));
  console.log(`Exportação concluída com sucesso! Arquivo: ${fileName}`);
}

exportAllData()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });