import { after, NextRequest, NextResponse } from "next/server";
import { consumeLinkToken } from "@/lib/db/queries/telegram";

const LINK_TOKEN_PATTERN = /^[A-Z0-9]{4}-[A-Z0-9]{4}$/i;

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
