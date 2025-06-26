// import { env } from "@/env";
// import * as schema from "./schema";
// import { PostgresJsDatabase, drizzle } from "drizzle-orm/postgres-js";
// import postgres from "postgres";
//
// declare global {
//   // eslint-disable-next-line no-var -- only var works here
//   var database: PostgresJsDatabase<typeof schema> | undefined;
// }
//
// let database: PostgresJsDatabase<typeof schema>;
// let pg: ReturnType<typeof postgres>;
//
// if (env.NODE_ENV === "production") {
//   pg = postgres(env.DATABASE_URL);
//   database = drizzle(pg, { schema });
// } else {
//   if (!global.database) {
//     pg = postgres(env.DATABASE_URL);
//     global.database = drizzle(pg, { schema });
//   }
//   database = global.database;
// }
//
// export { database, pg };

// ... existing imports ...

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

const client = postgres(process.env.DATABASE_URL!, {
  prepare: false, // Important: Transaction pooler doesn't support prepared statements
  ssl: { rejectUnauthorized: false },
});

export const database = drizzle(client, { schema });
