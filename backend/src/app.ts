import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import normaRoutes from "./routes/norma.routes";

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/normas", normaRoutes);

export default app;