# Архитектура (текущее состояние)

## Стек
- Next.js (App Router) + React + TypeScript, Tailwind.
- Монолит: фронт, серверная логика и Telegram-вебхук в одном Next-приложении.
- БД: Neon (Postgres, serverless, auto-resume из scale-to-zero).
- ORM/миграции: Drizzle.
- Auth: Neon Auth (Stack Auth), email + пароль. Управляемый: логин/сессии/сброс
  пароля/верификация — платформой. Пользователи синкаются в neon_auth.users_sync.
- Графики: Recharts.
- Хостинг: Vercel (staging = preview-деплой, prod = production-деплой).

## Модель доступа
Два слоя защиты. 1) App-layer: весь доступ к БД идёт через server-only слой
`lib/db/queries/*`, который ВСЕГДА фильтрует по `userId` из серверной сессии Neon Auth
(getUser на сервере). Клиент в БД напрямую не ходит, мутации — только Server Actions
и вебхук. 2) RLS (Neon RLS / neon_authorize): на categories/transactions/telegram_*
включён RLS с policy `user_id = auth.user_id()` — подстраховка на случай бага в коде.
См. decisions (ГРАБЛЯ про userId — RLS не освобождает от фильтрации в коде).

## Схема БД (детали в drizzle/schema.ts)
- users — управляется Neon Auth в схеме neon_auth.users_sync (id (text/uuid), email, ...).
  Свои таблицы хранят user_id (ссылка на этот id); FK-целостность — по возможности.
- categories: id, user_id, name, kind (expense|income), icon, color, sort_order, is_default.
  При первом входе сидятся 8 дефолтных категорий расходов.
- transactions: id, user_id, category_id→categories, type (expense|income),
  amount_minor (integer, копейки), comment, occurred_at (date), source (web|telegram), created_at.
- telegram_accounts: user_id (unique), telegram_id (bigint unique), chat_id, linked_at.
- telegram_link_tokens: token (pk), user_id, expires_at (одноразовый, TTL 15 мин).
- budgets (Фаза 2): id, user_id, category_id, period_month, limit_minor.

Связи: user_id 1—* categories, transactions, link_tokens; user_id 1—1 telegram_accounts;
categories 1—* transactions. Деньги — только integer-копейки, одна валюта (RUB).

## API / эндпоинты
Мутации из веба — Server Actions (`actions/*`), не REST. REST только для внешнего Telegram.
- Server Actions: createTransaction, updateTransaction, deleteTransaction,
  createTelegramLinkToken, unlinkTelegram (Фаза 2: категории, бюджеты).
- Server-компоненты (чтение через `lib/db/queries`): список транзакций по месяцу,
  getMonthSummary, getByCategory, getByDay.
- /handler/[...stack] — маршруты Neon Auth (Stack Auth): login/register/logout/сброс.
- POST /api/telegram/webhook — приём апдейтов Telegram. Защита: secret_token в заголовке
  (X-Telegram-Bot-Api-Secret-Token). Обрабатывает `/start <token>` (привязка) и
  сообщения вида "кофе 200" (парс → категория → транзакция → ответ ботом).

## Флоу
- auth: регистрацию/логин/сессии/сброс пароля ведёт Neon Auth (Stack Auth). На сервере
  берём пользователя (getUser); при первом входе — сид 8 дефолтных категорий.
  Middleware защищает группу `(app)`.
- платежи: нет.
- Telegram-привязка (опционально): страница settings/telegram → генерим одноразовый токен →
  показываем deep-link `t.me/<bot>?start=<token>` → пользователь жмёт Start → вебхук валидирует
  токен и связывает telegram_id↔user_id.
- Ключевой сценарий (транзакция из TG): "кофе 200" → вебхук находит user по telegram_id →
  парсит сумму и текст → сопоставляет категорию (ключевые слова, иначе дефолт) →
  вставляет transaction (source=telegram, occurred_at=now) → бот отвечает "✅ Записал…".
  Транзакция сразу видна в вебе.

## Env-переменные (значения — в .env, не коммитить)
- DATABASE_URL — строка подключения Neon (pooled).
- NEXT_PUBLIC_STACK_PROJECT_ID — id проекта Neon Auth (Stack).
- NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY — публичный клиентский ключ Neon Auth.
- STACK_SECRET_SERVER_KEY — серверный секрет Neon Auth.
- TELEGRAM_BOT_TOKEN — токен бота.
- TELEGRAM_WEBHOOK_SECRET — секрет для проверки заголовка вебхука.
- NEXT_PUBLIC_APP_URL — публичный URL (для формирования deep-link на бота).
