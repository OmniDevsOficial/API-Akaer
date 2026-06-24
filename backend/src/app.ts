import express from "express";
import cors from "cors";
import path from "path";
import authRoutes from "./routes/auth.routes";
import normaRoutes from "./routes/norma.routes";
import optionsRoutes from "./routes/options.routes";
import solicitacaoRoutes from "./routes/solicitacao.routes";
import usuarioRoutes from "./routes/usuario.routes";
import categoriaRoutes from "./routes/categoria.routes";

const app = express();

app.use(cors({ origin: ["http://localhost:5173","https://api-akaer.vercel.app"] }));
app.use(express.json());
app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));

app.use("/auth", authRoutes);
app.use("/solicitacoes", solicitacaoRoutes);
app.use("/api/solicitacoes", solicitacaoRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/normas", normaRoutes);
app.use("/categorias", categoriaRoutes);
app.use("/", optionsRoutes);

export default app;
