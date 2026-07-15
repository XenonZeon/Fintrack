import { after, NextRequest, NextResponse } from "next/server";
import { getCategoriesForUser } from "@/lib/db/queries/categories";
import { consumeLinkToken, getUserIdByTelegramId } from "@/lib/db/queries/telegram";
import {
  createTransaction,
  getTransactionById,
  updateTransactionCategory,
} from "@/lib/db/queries/transactions";
import { formatSignedRub } from "@/lib/format/money";
import { dateParam } from "@/lib/format/month-nav";
import { revalidateTransactionPaths } from "@/lib/revalidate-transactions";
import { parseTransactionMessage } from "@/lib/telegram/parse-message";

const LINK_TOKEN_PATTERN = /^[A-Z0-9]{4}-[A-Z0-9]{4}$/i;
const FALLBACK_CATEGORY_NAME = "Прочее";

function todayDateParam() {
  const now = new Date();
  return dateParam(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

type InlineKeyboard = { inline_keyboard: { text: string; callback_data: string }[][] };

type TelegramUpdate = {
  message?: {
    text?: string;
    chat: { id: number };
    from?: { id: number; username?: string };
  };
  callback_query?: {
    id: string;
    data?: string;
    from: { id: number };
    message?: { message_id: number; chat: { id: number } };
  };
};

async function callTelegramApi(method: string, body: unknown) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;

  await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function sendMessage(chatId: number, text: string, replyMarkup?: InlineKeyboard) {
  await callTelegramApi("sendMessage", {
    chat_id: chatId,
    text,
    ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
  });
}

async function answerCallbackQuery(callbackQueryId: string, text?: string) {
  await callTelegramApi("answerCallbackQuery", { callback_query_id: callbackQueryId, text });
}

async function editMessageText(chatId: number, messageId: number, text: string) {
  await callTelegramApi("editMessageText", { chat_id: chatId, message_id: messageId, text });
}

async function editMessageReplyMarkup(chatId: number, messageId: number, replyMarkup: InlineKeyboard) {
  await callTelegramApi("editMessageReplyMarkup", {
    chat_id: chatId,
    message_id: messageId,
    reply_markup: replyMarkup,
  });
}

async function notifyAdmin(text: string) {
  const adminChatId = Number(process.env.TELEGRAM_ADMIN_CHAT_ID);
  if (!Number.isFinite(adminChatId) || !adminChatId) return;
  await sendMessage(adminChatId, text);
}

function categoryConfirmKeyboard(transactionId: string): InlineKeyboard {
  return {
    inline_keyboard: [
      [
        { text: "✅ Верно", callback_data: `catok:${transactionId}` },
        { text: "✏️ Другая категория", callback_data: `catfix:${transactionId}` },
      ],
    ],
  };
}

async function expenseCategoriesForUser(userId: string) {
  const categories = await getCategoriesForUser(userId);
  return categories.filter((c) => c.kind === "expense").sort((a, b) => a.sortOrder - b.sortOrder);
}

function categoryPickerKeyboard(transactionId: string, categories: { name: string; icon: string | null }[]): InlineKeyboard {
  const buttons = categories.map((category, index) => ({
    text: category.icon ? `${category.icon} ${category.name}` : category.name,
    callback_data: `setcat:${transactionId}:${index}`,
  }));

  const rows: { text: string; callback_data: string }[][] = [];
  for (let i = 0; i < buttons.length; i += 2) {
    rows.push(buttons.slice(i, i + 2));
  }
  return { inline_keyboard: rows };
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
    const targetName = parsed.categoryKeyword ?? FALLBACK_CATEGORY_NAME;
    const category =
      userCategories.find((c) => c.kind === "expense" && c.name === targetName) ??
      userCategories.find((c) => c.kind === "expense" && c.isDefault && c.name === FALLBACK_CATEGORY_NAME) ??
      null;
    categoryId = category?.id ?? null;
    categoryName = category?.name ?? null;
  }

  const transactionId = await createTransaction(userId, {
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

  const isUncertainFallback =
    parsed.type === "expense" && (!categoryId || (!parsed.categoryKeyword && categoryName === FALLBACK_CATEGORY_NAME));
  await sendMessage(
    chatId,
    `✅ Добавлено: ${parts.join(" · ")}`,
    isUncertainFallback ? categoryConfirmKeyboard(transactionId) : undefined
  );
}

async function handleCallbackQuery(callbackQuery: NonNullable<TelegramUpdate["callback_query"]>) {
  const data = callbackQuery.data ?? "";
  const message = callbackQuery.message;
  if (!message) {
    await answerCallbackQuery(callbackQuery.id);
    return;
  }
  const chatId = message.chat.id;
  const messageId = message.message_id;

  if (data.startsWith("catok:")) {
    await answerCallbackQuery(callbackQuery.id, "Оставили как есть");
    await editMessageReplyMarkup(chatId, messageId, { inline_keyboard: [] });
    return;
  }

  if (data.startsWith("catfix:")) {
    const transactionId = data.slice("catfix:".length);
    const userId = await getUserIdByTelegramId(callbackQuery.from.id);
    if (!userId) {
      await answerCallbackQuery(callbackQuery.id, "Бот не подключён к аккаунту");
      return;
    }

    const categories = await expenseCategoriesForUser(userId);
    await editMessageReplyMarkup(chatId, messageId, categoryPickerKeyboard(transactionId, categories));
    await answerCallbackQuery(callbackQuery.id);
    return;
  }

  if (data.startsWith("setcat:")) {
    const [, transactionId, indexStr] = data.split(":");
    const userId = await getUserIdByTelegramId(callbackQuery.from.id);
    if (!userId) {
      await answerCallbackQuery(callbackQuery.id, "Бот не подключён к аккаунту");
      return;
    }

    const [categories, transaction] = await Promise.all([
      expenseCategoriesForUser(userId),
      getTransactionById(userId, transactionId),
    ]);
    const category = categories[Number(indexStr)];
    if (!category || !transaction) {
      await answerCallbackQuery(callbackQuery.id, "Не удалось обновить категорию");
      return;
    }

    await updateTransactionCategory(userId, transactionId, category.id);
    revalidateTransactionPaths();
    await editMessageText(chatId, messageId, `Категория обновлена: ${category.name}`);
    await answerCallbackQuery(callbackQuery.id, "Готово");

    await notifyAdmin(
      `Исправлено: "${transaction.comment ?? ""}" был ${FALLBACK_CATEGORY_NAME} → ${category.name} (userId: ${userId})`
    );
    return;
  }

  await answerCallbackQuery(callbackQuery.id);
}

async function handleUpdate(update: TelegramUpdate) {
  if (update.callback_query) {
    await handleCallbackQuery(update.callback_query);
    return;
  }

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
