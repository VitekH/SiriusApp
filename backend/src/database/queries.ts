import { db } from "../database/index.js";

type DatabaseUser = {
  id: number;
  member_id: number;
  username: string;
  password_hash: string;
};

type User = {
    id: number;
    username: string;
    member_id: number;
    first_name: string;
    last_name: string;
    nickname: string | null;
    permissions: Record<string, number>;
};

type Permission = {
    name: string;
    value: number;
}

type Permissions = Record<string, number>



export function getUserByUsername(username: string): DatabaseUser | undefined {
  return db.prepare(`
    SELECT id, member_id, username, password_hash
    FROM users
    WHERE username = ?
  `).get(username) as DatabaseUser | undefined;
}

export function getUserById(id: number): User | undefined {
    return db.prepare(`
        SELECT
            users.id,
            users.username,
            users.member_id,
            members.first_name,
            members.last_name,
            members.nickname
        FROM users
        JOIN members ON users.member_id = members.id
        WHERE users.id = ?
    `).get(id) as User | undefined;
}

export function getPermissionsById(id: number): Permissions {
    const rows = db.prepare(`
            SELECT modules.name, user_permissions.value
            FROM user_permissions
            JOIN modules ON modules.id = user_permissions.module_id
            WHERE user_permissions.user_id = ?
    `).all(id) as Permission[];

    return Object.fromEntries(
        rows.map(({ name, value }) => [name, value])
    )
}