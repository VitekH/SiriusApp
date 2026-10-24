import { lazy } from "react";

export const navigation = [
    { path: "/schuzky", name: "meetings", label: "Schůzky", component: lazy(() => import("../pages/Meetings.tsx")), layout: "main" },
    { path: "/vypravy", name: "events", label: "Výpravy", component: lazy(() => import("../pages/Events.tsx")), layout: "main" },
    { path: "/web", name: "web", label: "Web", component: lazy(() => import("../pages/Web.tsx")), layout: "main" },
    { path: "/finance", name: "finance", label: "Finance", component: lazy(() => import("../pages/Finance.tsx")), layout: "main" },
    { path: "/granty", name: "grants", label: "Granty", component: lazy(() => import("../pages/Grants.tsx")), layout: "main" },
    { path: "/databaze", name: "database", label: "Databáze", component: lazy(() => import("../pages/Database.tsx")), layout: "main" },
] as const;