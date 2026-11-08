export type Module = string;

export const permissionLevel = {
  none: 0,
  read: 1,
  write: 2,
  delete: 3
} as const;

export type PermissionLevel =
(typeof permissionLevel)[keyof typeof permissionLevel];

export type Permissions = Record<Module, PermissionLevel>;

export type AuthUser = {
  id: number;
  username: string;
  member_id: number;
  permissions: Permissions;
};