export const Modules = {
    Meetings: { value: "meetings", label: "Schůzky" },
    Events: { value: "events", label: "Výpravy" },
    Web: { value: "web", label: "Web" },
    Finance: { value: "finance", label: "Finance" },
    Grants: { value: "grants", label: "Granty" },
    Database: { value: "database", label: "Databáze" },
} as const;

export type Module =
    (typeof Modules)[keyof typeof Modules]["value"];