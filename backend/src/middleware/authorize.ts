import type { Request, Response, NextFunction } from "express";
import { getPermissionsById } from "../database/queries.js";

export function authorize(
    module: string,
    requiredLevel: number,
) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            res.status(401).json({ error: "Nejste přihlášeni." });
            return;
        }

        const permissions = getPermissionsById(req.user.id);
        const permission = permissions[module];

        if (permission === undefined || permission < requiredLevel) {
            res.status(403).json({
                error: "Nemáte dostatečná oprávnění."
            });
            return;
        }

        next();
    };
}