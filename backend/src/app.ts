import express from "express";
import authRouter from "./routes/auth.js";
import databaseRouter from "./routes/database.js"

export const app = express();

app.use(express.json());

app.use("/api", authRouter)

app.use("/api/database", databaseRouter);