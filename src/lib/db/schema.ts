import { pgTable, uuid, timestamp, text, integer, boolean, pgEnum, unique } from "drizzle-orm/pg-core";

export const healthCheck = pgTable("health_check", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const categoryKind = pgEnum("category_kind", ["expense", "income"]);

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    kind: categoryKind("kind").notNull(),
    icon: text("icon"),
    color: text("color"),
    sortOrder: integer("sort_order").notNull().default(0),
    isDefault: boolean("is_default").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [unique("categories_user_id_name_unique").on(table.userId, table.name)]
);
