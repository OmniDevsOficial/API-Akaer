import multer from "multer";
import path from "path";
import fs from "fs";

const UPLOAD_DIR = path.resolve(__dirname, "../../uploads");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, path.basename(file.originalname));
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype !== "application/pdf") {
    return cb(new Error("Apenas PDF é permitido"), false);
  }
  
  const fileName = path.basename(file.originalname);
  const filePath = path.join(UPLOAD_DIR, fileName);
  if (fs.existsSync(filePath)) {
    return cb(new Error("Já existe uma norma com esse arquivo (ou mesmo nome de arquivo)."), false);
  }

  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 } // Limite: 20MB
});