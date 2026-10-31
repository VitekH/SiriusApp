import { Router } from "express";
import { db } from "../database/index.js";

const router = Router();

type Leader = {
    id: number;
    first_name: string;
    nickname: string | null;
    permissions: Record<string, number>;
};

router.get("/get-permissions", (req, res) => {
    try {
        const rows = db.prepare(`
            SELECT
                members.id,
                members.first_name,
                members.nickname,
                modules.name AS module,
                user_permissions.value AS permission
            FROM members
            JOIN groups
                ON members.group_id = groups.id
            LEFT JOIN user_permissions
                ON user_permissions.user_id = members.id
            LEFT JOIN modules
                ON modules.id = user_permissions.module_id
            WHERE groups.is_kids = 0
                AND members.is_active = 1
            ORDER BY members.id
        `).all() as {
            id: number;
            first_name: string;
            nickname: string | null;
            module: string | null;
            permission: number | null;
        }[];

        const leaders = new Map<number, Leader>();

        for (const row of rows) {
            if (!leaders.has(row.id)) {
                leaders.set(row.id, {
                    id: row.id,
                    first_name: row.first_name,
                    nickname: row.nickname,
                    permissions: {},
                });
            }

            if (row.module !== null && row.permission !== null) {
                leaders.get(row.id)!.permissions[row.module] = row.permission;
            }
        }
        res.json(Array.from(leaders.values()));
    } catch (error) {
        console.error("Failed to fetch permissions:", error);
        res.status(500).json({ error: "Failed to fetch permissions." });
    }
});

router.patch("/update-permission", (req, res) => {
    const { memberId, module, permission } = req.body;

    if (
        !Number.isInteger(memberId) ||
        typeof module !== "string" ||
        ![0, 1, 2, 4].includes(permission)
    ) {
        return res.status(400).json({
            error: "Invalid permission data.",
        });
    }

    try {
        const result = db.prepare(`
            UPDATE user_permissions
            SET value = ?
            WHERE user_id = ?
                AND module_id = (
                    SELECT id FROM modules WHERE name = ?
                )
        `).run(permission, memberId, module);

        if (result.changes === 0) {
            return res.status(404).json({
                error: "Member or module not found.",
            });
        }

        return res.sendStatus(204);
    } catch (error) {
        console.error("Failed to update permission:", error);
        return res.status(500).json({
            error: "Failed to update permission.",
        });
    }
});


export default router;