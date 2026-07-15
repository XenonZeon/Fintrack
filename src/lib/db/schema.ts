import { pgTable, uuid, timestamp, text, integer, boolean, pgEnum, unique, date, bigint } from "drizzle-orm/pg-core";

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

export const transactionSource = pgEnum("transaction_source", ["web", "telegram"]);

export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  categoryId: uuid("category_id").references(() => categories.id),
  type: categoryKind("type").notNull(),
  amountMinor: integer("amount_minor").notNull(),
  comment: text("comment"),
  occurredAt: date("occurred_at").notNull(),
  source: transactionSource("source").notNull().default("web"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const telegramAccounts = pgTable("telegram_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().unique(),
  telegramId: bigint("telegram_id", { mode: "number" }).notNull().unique(),
  chatId: bigint("chat_id", { mode: "number" }).notNull(),
  telegramUsername: text("telegram_username"),
  linkedAt: timestamp("linked_at", { withTimezone: true }).defaultNow().notNull(),
});

export const telegramLinkTokens = pgTable("telegram_link_tokens", {
  token: text("token").primaryKey(),
  userId: text("user_id").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const budgets = pgTable(
  "budgets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    periodMonth: date("period_month").notNull(),
    limitMinor: integer("limit_minor").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique("budgets_user_id_category_id_period_month_unique").on(
      table.userId,
      table.categoryId,
      table.periodMonth
    ),
  ]
);
