import express from "express";
import cors from "cors";
import path from "path";
import authRoutes from "./routes/auth.routes";
import normaRoutes from "./routes/norma.routes";

const app = express();

app.use(cors({ origin: ["http://localhost:5173","https://api-akaer.vercel.app"] }));
app.use(express.json());
app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));

app.use("/api/auth", authRoutes);

export default app;
