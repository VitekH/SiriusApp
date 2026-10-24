export const permissions = [
    "meetings.read",
    "meetings.write",

    "events.read",
    "events.write",
    
    "web.read",
    "web.write",
    
    "finance.read",
    "finance.write",
    
    "grants.read",
    "grants.write",
    
    "database.read",
    "database.write",
] as const;

export type Permission = (typeof permissions)[number];