import { Router } from "express";
import argon2 from "argon2";
import jwt from 'jsonwebtoken';
import { getPermissionsById, getUserById, getUserByUsername } from "../database/queries.js";
import { loginRateLimit } from "../middleware/loginRateLimit.js";
import { authenticate } from "../middleware/authenticate.js";

const router = Router();

type LoginRequest = {
    username: string;
    password: string;
};

router.post("/login", loginRateLimit, async (req, res) => {
    try {
        const { username, password } = req.body as LoginRequest;

        if (
            typeof username !== "string" ||
            typeof password !== "string" ||
            !username.trim() ||
            !password
        ) {
            res.status(400).json({ error: "Vyplňte jméno a heslo." });
            return;
        }

        const user = getUserByUsername(username.trim());

        if (!user || !(await argon2.verify(user.password_hash, password))) {
            res.status(401).json({ error: "Neplatné jméno nebo heslo." });
            return;
        }

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET!,
            { expiresIn: "1d" }
        );

        res.cookie("user_session", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000,
            path: "/",
        });

        res.json({ message: "Přihlášení proběhlo úspěšně." });
    } catch (error) {
        console.error("Login failed:", error);
        res.status(500).json({ error: "Chyba serveru." });
    }
});

router.get("/me", authenticate, (req, res) => {
    try {
        const token = req.cookies?.user_session;

        if (!token) {
            res.status(401).json({ error: "Nejste přihlášeni." });
            return;
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET!
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

        const permissions = getPermissionsById(user.id)

        res.json({
            user: {
                ...user,
                permissions: permissions,
            },
        });
    } catch {
        res.status(401).json({ error: "Neplatné přihlášení." });
    }
});

export default router;