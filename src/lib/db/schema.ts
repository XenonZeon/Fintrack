import { pgTable, uuid, timestamp } from "drizzle-orm/pg-core";

export const healthCheck = pgTable("health_check", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
