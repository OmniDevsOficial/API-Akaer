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

    await prisma.user.upsert({
        where: { email: 'admin1@gmail.com' },
        update: {},
        create: { nome: 'Administrador', email: 'admin1@gmail.com', password: hashedPassword1, role: 'ADMIN' },
      },
    );
    await prisma.user.upsert({
        where: { email: 'viewer1@gmail.com' },
        update: {},
        create: { nome: 'Visualizador', email: 'viewer1@gmail.com', password: hashedPassword2, role: 'VISUALIZADOR' },
      },
    );
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