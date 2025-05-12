import { pgTable, serial } from "drizzle-orm/pg-core";

export const bids = pgTable("auc-bids", {
  id: serial("id").primaryKey(),
});
