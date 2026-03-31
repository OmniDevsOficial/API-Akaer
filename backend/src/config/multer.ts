import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { Request } from 'express';

export const multerConfig: multer.Options = {
  storage: multer.diskStorage({
    destination: (req, file, callback) => {
        // Diretório para os arquivos serao enviados
      callback(null, path.resolve(__dirname, '..', '..', 'uploads'));
    },
    filename: (req, file, callback) => {
        // Gera um hash aleatório no lugar do nome do arquivo (coloquei provisóriamente mas telvez seja melhor deixar o nome original do arquivo para facilitar a identificação e pesquisa do arquivo depois - trocar depois para o nome original do arquivo + numero para evitar conflitos de arquivos com o mesmo nome)
      const hash = crypto.randomBytes(6).toString('hex');
      const uniqueFileName = `${hash}-${file.originalname}`;
      
      callback(null, uniqueFileName);
    }
  }),
  
  limits: {
    // Limite de 20MB (x*1024*1024 = xMB)
    fileSize: 20 * 1024 * 1024 
  },
  
  // Filtra os tipos de arquivos PDF ou Word
  fileFilter: (req: Request, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
    const allowedMimes = [
      'application/pdf',
      'application/msword', // .doc
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
    ];

    if (allowedMimes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new Error('Tipo de arquivo inválido. Apenas PDF e Word.'));
    }
  }
};