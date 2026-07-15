CREATE EXTENSION IF NOT EXISTS pg_session_jwt;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON categories, transactions, telegram_accounts, telegram_link_tokens, budgets TO authenticated;--> statement-breakpoint
ALTER TABLE "budgets" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "telegram_accounts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "telegram_link_tokens" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "transactions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-select" ON "budgets" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.user_id() = "budgets"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-insert" ON "budgets" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.user_id() = "budgets"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-update" ON "budgets" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.user_id() = "budgets"."user_id")) WITH CHECK ((select auth.user_id() = "budgets"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-delete" ON "budgets" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.user_id() = "budgets"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-select" ON "categories" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.user_id() = "categories"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-insert" ON "categories" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.user_id() = "categories"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-update" ON "categories" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.user_id() = "categories"."user_id")) WITH CHECK ((select auth.user_id() = "categories"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-delete" ON "categories" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.user_id() = "categories"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-select" ON "telegram_accounts" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.user_id() = "telegram_accounts"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-insert" ON "telegram_accounts" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.user_id() = "telegram_accounts"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-update" ON "telegram_accounts" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.user_id() = "telegram_accounts"."user_id")) WITH CHECK ((select auth.user_id() = "telegram_accounts"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-delete" ON "telegram_accounts" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.user_id() = "telegram_accounts"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-select" ON "telegram_link_tokens" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.user_id() = "telegram_link_tokens"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-insert" ON "telegram_link_tokens" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.user_id() = "telegram_link_tokens"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-update" ON "telegram_link_tokens" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.user_id() = "telegram_link_tokens"."user_id")) WITH CHECK ((select auth.user_id() = "telegram_link_tokens"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-delete" ON "telegram_link_tokens" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.user_id() = "telegram_link_tokens"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-select" ON "transactions" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.user_id() = "transactions"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-insert" ON "transactions" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.user_id() = "transactions"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-update" ON "transactions" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.user_id() = "transactions"."user_id")) WITH CHECK ((select auth.user_id() = "transactions"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-delete" ON "transactions" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.user_id() = "transactions"."user_id"));