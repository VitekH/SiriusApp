import type { User } from "../database/queries.ts";

declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}