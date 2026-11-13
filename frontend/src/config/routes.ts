import { lazy } from "react";
import { permissionLevel } from "./types.ts";

export const routes = [
  {
    path: "/databaze/prava",
    name: "database-permissions",
    label: "Práva",
    component: lazy(() => import("../pages/Permissions.tsx")),
    layout: "main",
    module: "database",
    requiredPermission: permissionLevel.read,
  },
  {
    path: "/konfigurace/plan-akci",
    name: "config-calendar",
    label: "Konfigurace plánu akcí",
    component: lazy(() => import("../pages/ConfigCalendar.tsx")),
    layout: "main",
    module: "config",
    requiredPermission: permissionLevel.read,
  }
] as const;
