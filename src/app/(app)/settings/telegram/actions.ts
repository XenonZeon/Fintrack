"use server";

import { revalidatePath } from "next/cache";
import QRCode from "qrcode";
import { getCurrentUser } from "@/lib/auth/current-user";
import { issueLinkToken, unlinkTelegramAccount } from "@/lib/db/queries/telegram";

function buildDeepLink(token: string) {
  const username = process.env.TELEGRAM_BOT_USERNAME;
  if (!username) throw new Error("TELEGRAM_BOT_USERNAME is not set");
  return `https://t.me/${username}?start=${token}`;
}

export async function issueTelegramLinkTokenAction() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const { token, expiresAt } = await issueLinkToken(user.id);
  const deepLink = buildDeepLink(token);
  const qrDataUrl = await QRCode.toDataURL(deepLink, { margin: 1, width: 320 });

  return { token, expiresAt: expiresAt.toISOString(), deepLink, qrDataUrl };
}

export async function unlinkTelegramAction(): Promise<{ error: string } | null> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  await unlinkTelegramAccount(user.id);
  revalidatePath("/settings/telegram");
  return null;
}
