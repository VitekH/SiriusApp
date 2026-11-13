import { Router } from "express";
import { db } from "../database/index.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

const router = Router();

type Leader = {
  id: number;
  first_name: string;
  nickname: string | null;
  permissions: Record<string, number>;
};

router.get(
  "/get-permissions",
  authenticate,
  authorize("database", 1),
  (req, res) => {
    try {
      const rows = db
        .prepare(
          `
            SELECT
                users.id,
                members.first_name,
                members.nickname,
                modules.id AS module_id,
                modules.name AS module_name,
                user_permissions.value AS permission
            FROM members
            JOIN users
                ON users.member_id = members.id
            LEFT JOIN user_permissions
                ON user_permissions.user_id = users.id
            LEFT JOIN modules
                ON modules.id = user_permissions.module_id
            ORDER BY members.id;
        `,
        )
        .all() as {
        id: number;
        first_name: string;
        nickname: string | null;
        module_id: string;
        module_name: string;
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

        if (row.module_id !== null && row.permission !== null) {
          leaders.get(row.id)!.permissions[row.module_id] = row.permission;
        }
      }
      res.json(Array.from(leaders.values()));
    } catch (error) {
      console.error("Failed to fetch permissions:", error);
      res.status(500).json({ error: "Failed to fetch permissions." });
    }
  },
);

router.patch(
  "/update-permission",
  authenticate,
  authorize("database", 2),
  (req, res) => {
    const { memberId, moduleId, permission } = req.body;

    if (
      !Number.isInteger(memberId) ||
      !Number.isInteger(moduleId) ||
      !Number.isInteger(permission) ||
      permission < 0 ||
      permission > 3
    ) {
      return res.status(400).json({
        error: "Invalid permission data.",
      });
    }

    try {
      const result = db
        .prepare(
          `
            UPDATE user_permissions
            SET value = ?
            WHERE user_id = ?
                AND module_id = ?
        `,
        )
        .run(permission, memberId, moduleId);

      if (result.changes === 0) {
        db.prepare(
          `
                INSERT INTO user_permissions
                (user_id, module_id, value)
                VALUES (?, ?, ?)

            `,
        ).run(memberId, moduleId, permission);
      }

      return res.sendStatus(204);
    } catch (error) {
      console.error("Failed to update permission:", error);
      return res.status(500).json({
        error: "Failed to update permission.",
      });
    }
  },
);

router.get("/get-modules", authenticate, (req, res) => {
  try {
    const result = db
      .prepare(
        `
            SELECT
                id, name, label
            FROM modules
            ORDER BY id;
        `,
      )
      .all() as {
      id: number;
      name: string;
      label: string | null;
    }[];

    res.json(result);
  } catch (error) {
    console.error("Failed to fetch modules:", error);
    res.status(500).json({ error: "Failed to fetch modules." });
  }
});

router.get(
  "/get-event-types",
  authenticate,
  authorize("config", 1),
  (req, res) => {
    try {
      const result = db
        .prepare(
          `
            SELECT *
            FROM event_types
            ORDER BY id;
        `,
        )
        .all() as {
        id: number;
        name: string;
        label: string;
      }[];

      res.json(result);
    } catch (error) {
      console.error("Failed to fetch event types:", error);
      res.status(500).json({ error: "Failed to fetch event types." });
    }
  },
);

export default router;
