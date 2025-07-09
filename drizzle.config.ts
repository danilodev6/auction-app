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
  // Exclude all Supabase system schemas and tables
  tablesFilter: [
    "!auth.*",
    "!storage.*",
    "!realtime.*",
    "!supabase_functions.*",
    "!extensions.*",
    "!graphql.*",
    "!graphql_public.*",
    "!net.*",
    "!pgsodium.*",
    "!pgsodium_masks.*",
    "!vault.*",
    "!pg_*",
    "!information_schema.*",
  ],
  schemaFilter: ["public"],
});

// import { defineConfig } from "drizzle-kit";
//
// export default defineConfig({
//   schema: "./src/db/schema.ts",
//   dialect: "postgresql",
//   out: "./drizzle",
//   dbCredentials: {
//     url: process.env.DATABASE_URL!,
//   },
//   verbose: true,
//   strict: true,
//   tablesFilter: ["!pg_*"],
// });
