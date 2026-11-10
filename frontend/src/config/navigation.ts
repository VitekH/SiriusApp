import { lazy, type LazyExoticComponent, type ComponentType } from "react";
import { permissionLevel } from "./types.ts";


type NavigationItem = {
  path: string;
  name: string;
  label: string;
  component: LazyExoticComponent<ComponentType>;
  layout: string;
  module?: string;
  requiredPermission?: number;
};

export const navigation = [
  {
    path: "/schuzky",
    name: "meetings",
    label: "Schůzky",
    component: lazy(() => import("../pages/Meetings.tsx")),
    layout: "main",
    module: "meetings",
    requiredPermission: permissionLevel.read,
  },
  {
    path: "/vypravy",
    name: "events",
    label: "Výpravy",
    component: lazy(() => import("../pages/Events.tsx")),
    layout: "main",
    module: "events",
    requiredPermission: permissionLevel.read,
  },
  {
    path: "/web",
    name: "web",
    label: "Web",
    component: lazy(() => import("../pages/Web.tsx")),
    layout: "main",
    module: "web",
    requiredPermission: permissionLevel.read,
  },
  {
    path: "/finance",
    name: "finance",
    label: "Finance",
    component: lazy(() => import("../pages/Finance.tsx")),
    layout: "main",
    module: "finance",
    requiredPermission: permissionLevel.read,
  },
  {
    path: "/granty",
    name: "grants",
    label: "Granty",
    component: lazy(() => import("../pages/Grants.tsx")),
    layout: "main",
    module: "grants",
    requiredPermission: permissionLevel.read,
  },
  {
    path: "/databaze",
    name: "database",
    label: "Databáze",
    component: lazy(() => import("../pages/Database.tsx")),
    layout: "main",
    module: "database",
    requiredPermission: permissionLevel.read,
  },
    {
    path: "/ucet",
    name: "ucet",
    label: "Účet",
    component: lazy(() => import("../pages/User.tsx")),
    layout: "main",
  },
] satisfies NavigationItem[];
