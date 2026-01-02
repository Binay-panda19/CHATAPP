import express from "express";
import authRoutes from "./routes/auth.route.js";
import msgRoutes from "./routes/message.route.js";
import cookieParser from "cookie-parser";
export const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/msg", msgRoutes);
