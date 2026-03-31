/// <reference types="node" />
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import { hashPassword } from "../../src/utils/hash";

const prisma = new PrismaClient();

async function main() {
  const importsDir = './prisma/imports';
  let backupFileName: string | null = null;

  // Verifica a existência de arquivos na pasta imports
  if (fs.existsSync(importsDir)) {
    const files = fs.readdirSync(importsDir);
    const jsonFiles = files.filter(file => file.endsWith('.json')); // Filtra só os .json

    // Ordena e escolhe o registro mais recente
    if (jsonFiles.length > 0) {
      backupFileName = jsonFiles.sort().reverse()[0];
    }
  }

  // Caso não haja json, insere um usuário padrão para poder logar no sistema
  if (!backupFileName) {
    console.log('Nenhum arquivo de backup (.json) encontrado na pasta imports. Inserindo apenas os dados vitais...');
    
    const hashedPassword = await hashPassword('admin123');

    await prisma.user.upsert({
      where: { email: 'admin1@gmail.com' },
      update: {},
      create: { email: 'admin1@gmail.com', password: hashedPassword, role: 'ADMIN' },
    });
    return;
  }

  // Cenário 2: existe arquivo json para ser importado
  console.log(`Arquivo de backup detectado: ${backupFileName}. Iniciando Importação...`);
  const rawData = fs.readFileSync(`${importsDir}/${backupFileName}`, 'utf-8');
  const bancoCompleto = JSON.parse(rawData);

  // Fazer com que todos os comandos executem de uma vez: na mesma transaction.
  await prisma.$transaction(async (tx) => {
    
    // 1. Desliga a verificação de Chaves Estrangeiras no MySQL (Pra ele não se importar com a ordem de inserção)
    await tx.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0;');

    try {
      // 2. Itera sobre o JSON
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
      // 3. Mesmo se o código der erro no meio, as travas de segurança do MySQL serão religadas.
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