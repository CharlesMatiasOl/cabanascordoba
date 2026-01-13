import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";

import publicCabinsRoutes from "./routes/publicCabins.routes";
import adminAuthRoutes from "./routes/adminAuth.routes";
import adminCabinsRoutes from "./routes/adminCabins.routes";
import adminBlocksRoutes from "./routes/adminBlocks.routes";

const app = express();

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "cabanas-cordoba-api" });
});

app.use("/api", publicCabinsRoutes);
app.use("/api", adminAuthRoutes);
app.use("/api", adminCabinsRoutes);
app.use("/api", adminBlocksRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: "No encontrado" });
});

app.use(errorHandler);

export default app;
