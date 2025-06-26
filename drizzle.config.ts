// import { env } from "@/env";
// import { defineConfig } from "drizzle-kit";
//
// export default defineConfig({
//   schema: "./src/db/schema.ts",
//   dialect: "postgresql",
//   out: "./drizzle",
//   dbCredentials: {
//     url: env.DATABASE_URL,
//   },
//   verbose: true,
//   strict: true,
//   tablesFilter: ["!pg_*"],
// });

import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
  tablesFilter: ["!pg_*"],
});
