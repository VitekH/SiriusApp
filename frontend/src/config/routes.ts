import { lazy } from "react";
import { permissionLevel } from "./types.ts";

export const routes = [
  {
    path: "/databaze/prava",
    name: "permissions",
    label: "Práva",
    component: lazy(() => import("../pages/Permissions.tsx")),
    layout: "main",
    module: "database",
    requiredPermission: permissionLevel.read,
  },
] as const;
