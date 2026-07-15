import "server-only";
import { cache } from "react";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";

function isDevAuthBypass() {
  return process.env.NODE_ENV !== "production" && process.env.DEV_SKIP_AUTH === "true";
}

const getSessionToken = cache(async (): Promise<string> => {
  const { data } = await auth.token();
  if (!data?.token) throw new Error("No active session for authenticated DB access");
  return data.token;
});

const authenticatedSql = neon(process.env.DATABASE_URL!, { authToken: getSessionToken });
const authenticatedDb = drizzle(authenticatedSql, { schema });

// RLS (policy user_id = auth.user_id()) only applies to the `authenticated` role;
// neondb_owner has rolbypassrls=true, so per-request auth is required for real enforcement.
export async function getUserDb() {
  if (isDevAuthBypass()) return db;
  return authenticatedDb;
}
