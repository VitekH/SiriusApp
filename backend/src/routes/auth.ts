import { Router } from "express";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import {
  getPermissionsById,
  getUserById,
  getUserByUsername,
  updatePasswordById,
} from "../database/queries.js";
import { loginRateLimit } from "../middleware/loginRateLimit.js";
import { authenticate } from "../middleware/authenticate.js";

const router = Router();

type LoginRequest = {
  username: string;
  password: string;
};

type PasswordChangeRequest = {
    currentPassword: string;
    newPassword: string;
}

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

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "1d",
    });

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

    const permissions = getPermissionsById(user.id);

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

router.post("/logout", authenticate, (req, res) => {
  try {
    res.clearCookie("user_session", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    res.status(200).json({
      message: "Successfully signed out.",
    });
  } catch {
    res.status(500).json({ error: "Odhlášení se nezdařilo." });
  }
});

router.patch("/update-password", authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword }: PasswordChangeRequest = req.body;
    
    if (!newPassword) {
        return res.status(400).json({ error: "Vyplňte nové heslo." });
    }
    
    const token = req.cookies?.user_session;
    
    if (!token) {
        return res.status(401).json({ error: "Nejste přihlášeni." });
    }
    
    const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET!,
    ) as jwt.JwtPayload;
    
    if (typeof decoded.userId !== "number") {
        return res.status(401).json({ error: "Neplatné přihlášení." });
    }
    
    const user = getUserById(decoded.userId);
    
    if (!user) {
        return res.status(401).json({ error: "Uživatel neexistuje." });
    }
    
    const databaseUser = getUserByUsername(user.username);
    
    if (!databaseUser) {
        return res.status(401).json({ error: "Uživatel neexistuje." });
    }
    
    const correctCurrent = await argon2.verify(databaseUser.password_hash, currentPassword);

    if (!correctCurrent) {
      return res.status(400).json({ error: "Nesprávné současné heslo." });
    }

    const isMatch = await argon2.verify(databaseUser.password_hash, newPassword);

    if (isMatch) {
      return res.status(400).json({ error: "Staré a nové heslo se nesmí shodovat." });
    }

    const newPasswordHash = await argon2.hash(newPassword);

    const result = updatePasswordById(user.id, newPasswordHash);

    if (result.changes === 0) {
        return res.status(404).json({ message: "Uživatel nenalezen." });
    }

    return res.status(204).json({ message: "Heslo úspěšně změněno." });
  } catch {
    return res.status(500).json({ error: "Změna hesla se nezdařila." });
  }
});

export default router;
