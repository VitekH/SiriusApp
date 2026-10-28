import Database from "better-sqlite3";

export const db = new Database("data/gjk.db")

db.pragma("foreign_keys = ON");
db.pragma("journal_mode = WAL");