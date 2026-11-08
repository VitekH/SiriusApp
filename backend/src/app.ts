import express from "express";
import authRouter from "./routes/auth.js";
import databaseRouter from "./routes/database.js"
import cookieParser from "cookie-parser";

export const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api", authRouter)

app.use("/api/database", databaseRouter);