export type Module = string;

export type ModuleRecord = {
  id: number;
  name: string;
  label: string
}

export const permissionLevel = {
  none: 0,
  read: 1,
  write: 2,
  delete: 3
} as const;

export const permissionLevelLabels = {
  [permissionLevel.none]: "Bez přístupu",
  [permissionLevel.read]: "Čtení",
  [permissionLevel.write]: "Úpravy",
  [permissionLevel.delete]: "Mazání",
} as const;

export type PermissionLevel =
(typeof permissionLevel)[keyof typeof permissionLevel];

export type Permissions = Record<Module, PermissionLevel>;

export type AuthUser = {
  id: number;
  first_name: string;
  last_name: string;
  nickname: string;
  username: string;
  member_id: number;
  permissions: Permissions;
};