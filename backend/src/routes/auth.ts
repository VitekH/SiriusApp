import { Router } from "express";
import argon2 from "argon2";
import { db } from "../database/index.js";

const router = Router();

type LoginRequest = {
    username: string;
    password: string;
};

type User = {
    id: number;
    username: string;
    password_hash: string;
    member_id: number;
};

router.post("/login", async (req, res) => {
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

    const user = db.prepare(`
        SELECT id, username, password_hash, member_id
        FROM users
        WHERE username = ?
    `).get(username.trim()) as User;

    if (!user || !(await argon2.verify(user.password_hash, password))) {
        res.status(401).json({ error: "Neplatné jméno nebo heslo." });
        return;
    }

    res.json({
        message: "Přihlášení úspěšné.",
        user: {
            id: user.id,
            username: user.username,
            member_id: user.member_id
        },
    });
});

export default router;