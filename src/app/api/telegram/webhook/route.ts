import { after, NextRequest, NextResponse } from "next/server";
import { getCategoriesForUser } from "@/lib/db/queries/categories";
import { consumeLinkToken, getUserIdByTelegramId } from "@/lib/db/queries/telegram";
import { createTransaction } from "@/lib/db/queries/transactions";
import { formatSignedRub } from "@/lib/format/money";
import { dateParam } from "@/lib/format/month-nav";
import { revalidateTransactionPaths } from "@/lib/revalidate-transactions";
import { parseTransactionMessage } from "@/lib/telegram/parse-message";

const LINK_TOKEN_PATTERN = /^[A-Z0-9]{4}-[A-Z0-9]{4}$/i;

function todayDateParam() {
  const now = new Date();
  return dateParam(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

type TelegramUpdate = {
  message?: {
    text?: string;
    chat: { id: number };
    from?: { id: number; username?: string };
  };
};

async function sendMessage(chatId: number, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}

async function tryLinkToken(
  rawToken: string,
  telegram: { telegramId: number; chatId: number; username?: string }
) {
  const userId = await consumeLinkToken(rawToken.trim().toUpperCase(), {
    telegramId: telegram.telegramId,
    chatId: telegram.chatId,
    username: telegram.username ?? null,
  });

  if (userId) {
    await sendMessage(telegram.chatId, "✅ Готово — бот подключён к твоему аккаунту в Финтрекере.");
  } else {
    await sendMessage(
      telegram.chatId,
      "Код недействителен или истёк. Обнови страницу Telegram-бот в Финтрекере и попробуй снова."
    );
  }
}

async function handleTransactionMessage(text: string, telegramId: number, chatId: number) {
  const userId = await getUserIdByTelegramId(telegramId);
  if (!userId) {
    await sendMessage(
      chatId,
      "Сначала подключи бота: открой «Telegram-бот» в настройках Финтрекера и пришли код оттуда."
    );
    return;
  }

  const parsed = parseTransactionMessage(text);
  if ("error" in parsed) {
    await sendMessage(chatId, "Не понял сумму. Напиши, например: 500 еда");
    return;
  }

  let categoryId: string | null = null;
  let categoryName: string | null = null;

  if (parsed.type === "expense") {
    const userCategories = await getCategoriesForUser(userId);
    const targetName = parsed.categoryKeyword ?? "Прочее";
    const category =
      userCategories.find((c) => c.kind === "expense" && c.name === targetName) ??
      userCategories.find((c) => c.kind === "expense" && c.isDefault && c.name === "Прочее") ??
      null;
    categoryId = category?.id ?? null;
    categoryName = category?.name ?? null;
  }

  await createTransaction(userId, {
    type: parsed.type,
    amountMinor: parsed.amountMinor,
    occurredAt: todayDateParam(),
    comment: parsed.comment,
    categoryId,
    source: "telegram",
  });
  revalidateTransactionPaths();

  const parts = [formatSignedRub(parsed.amountMinor, parsed.type)];
  if (categoryName) parts.push(categoryName);
  if (parsed.comment && parsed.comment.toLowerCase() !== categoryName?.toLowerCase()) {
    parts.push(parsed.comment);
  }
  await sendMessage(chatId, `✅ Добавлено: ${parts.join(" · ")}`);
}

async function handleUpdate(update: TelegramUpdate) {
  const message = update.message;
  const text = message?.text?.trim();

  if (!text || !message || !message.from) return;

  if (text.startsWith("/start")) {
    const token = text.split(" ")[1]?.trim();

    if (!token) {
      await sendMessage(
        message.chat.id,
        "Привет! Открой страницу «Telegram-бот» в Финтрекере и пришли мне код оттуда (например, A3F7-9K2Q)."
      );
    } else {
      await tryLinkToken(token, {
        telegramId: message.from.id,
        chatId: message.chat.id,
        username: message.from.username,
      });
    }
  } else if (LINK_TOKEN_PATTERN.test(text)) {
    await tryLinkToken(text, {
      telegramId: message.from.id,
      chatId: message.chat.id,
      username: message.from.username,
    });
  } else {
    await handleTransactionMessage(text, message.from.id, message.chat.id);
  }
}

export async function POST(request: NextRequest) {
  const secret = request.headers.get("X-Telegram-Bot-Api-Secret-Token");
  if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let update: TelegramUpdate;
  try {
    update = (await request.json()) as TelegramUpdate;
  } catch {
    return NextResponse.json({ ok: true });
  }

  after(() => handleUpdate(update));

  return NextResponse.json({ ok: true });
}
