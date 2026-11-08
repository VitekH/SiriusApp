import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getUserById } from "../database/queries.js";

export function authenticate(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const token = req.cookies?.user_session;

        if (!token) {
            res.status(401).json({ error: "Nejste přihlášeni." });
            return;
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET!,
        ) as jwt.JwtPayload;

        if (typeof decoded.userId !== "number") {
            res.status(401).json({ error: "Neplatné přihlášení." });
            return;
        }

        const user = getUserById(decoded.userId);

        if (!user) {
            res.status(401).json({ error: "Uživatel neexistuje." });
            return;
        }

        req.user = user;
        next();

    } catch {
        res.status(401).json({ error: "Neplatné přihlášení." });
    }
}