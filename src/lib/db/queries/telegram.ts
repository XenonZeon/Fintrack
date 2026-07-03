import "server-only";
import { randomInt } from "crypto";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories, telegramAccounts, telegramLinkTokens, transactions } from "@/lib/db/schema";

const TOKEN_TTL_MS = 15 * 60 * 1000;
const TOKEN_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // без 0/O/1/I

function generateTokenCode() {
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += TOKEN_ALPHABET[randomInt(TOKEN_ALPHABET.length)];
  }
  return `${code.slice(0, 4)}-${code.slice(4)}`;
}

export async function getTelegramAccount(userId: string) {
  return db.query.telegramAccounts.findFirst({
    where: eq(telegramAccounts.userId, userId),
  });
}

export async function getUserIdByTelegramId(telegramId: number) {
  const row = await db.query.telegramAccounts.findFirst({
    where: eq(telegramAccounts.telegramId, telegramId),
  });
  return row?.userId ?? null;
}

export async function countTelegramTransactions(userId: string) {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(transactions)
    .where(and(eq(transactions.userId, userId), eq(transactions.source, "telegram")));
  return row?.count ?? 0;
}

export async function getRecentTelegramTransactions(userId: string, limit: number) {
  return db
    .select({
      id: transactions.id,
      type: transactions.type,
      amountMinor: transactions.amountMinor,
      comment: transactions.comment,
      occurredAt: transactions.occurredAt,
      categoryName: categories.name,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(and(eq(transactions.userId, userId), eq(transactions.source, "telegram")))
    .orderBy(desc(transactions.occurredAt), desc(transactions.createdAt))
    .limit(limit);
}

export async function unlinkTelegramAccount(userId: string) {
  await db.delete(telegramAccounts).where(eq(telegramAccounts.userId, userId));
}

export async function issueLinkToken(userId: string) {
  const token = generateTokenCode();
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  await db.delete(telegramLinkTokens).where(eq(telegramLinkTokens.userId, userId));
  await db.insert(telegramLinkTokens).values({ token, userId, expiresAt });

  return { token, expiresAt };
}

export async function consumeLinkToken(
  token: string,
  telegram: { telegramId: number; chatId: number; username: string | null }
) {
  const row = await db.query.telegramLinkTokens.findFirst({
    where: eq(telegramLinkTokens.token, token),
  });
  if (!row || row.expiresAt < new Date()) return null;

  await db.delete(telegramAccounts).where(eq(telegramAccounts.telegramId, telegram.telegramId));

  await db
    .insert(telegramAccounts)
    .values({
      userId: row.userId,
      telegramId: telegram.telegramId,
      chatId: telegram.chatId,
      telegramUsername: telegram.username,
    })
    .onConflictDoUpdate({
      target: telegramAccounts.userId,
      set: {
        telegramId: telegram.telegramId,
        chatId: telegram.chatId,
        telegramUsername: telegram.username,
        linkedAt: new Date(),
      },
    });

  await db.delete(telegramLinkTokens).where(eq(telegramLinkTokens.token, token));

  return row.userId;
}
