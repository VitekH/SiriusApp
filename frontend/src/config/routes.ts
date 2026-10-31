import { lazy } from "react";

export const routes = [
    { path: "/databaze/prava", name: "permissions", label: "Práva", component: lazy(() => import("../pages/Permissions.tsx")), layout: "main" },
] as const;