import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype !== "application/pdf") {
    return cb(new Error("Apenas PDF é permitido"), false);
  }
  
  const filePath = path.join("uploads", file.originalname);
  if (fs.existsSync(filePath)) {
    return cb(new Error("Já existe uma norma cadastrada de mesmo nome"), false);
  }

  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 } // Limite: 20MB
});