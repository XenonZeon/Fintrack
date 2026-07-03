# Архитектура (текущее состояние)

## Стек
- Next.js (App Router) + React + TypeScript, Tailwind.
- Монолит: фронт, серверная логика и Telegram-вебхук в одном Next-приложении.
- БД: Neon (Postgres, serverless, auto-resume из scale-to-zero).
- ORM/миграции: Drizzle.
- Auth: Neon Auth (@neondatabase/neon-js, Better Auth под капотом), email + пароль.
  Управляемый: логин/сессии/сброс пароля/верификация — платформой. Вход требует
  подтверждённый email. Пользователи хранятся в neon_auth."user" (схема Better Auth).
- Графики: Recharts.
- Хостинг: Vercel (staging = preview-деплой, prod = production-деплой).
- Тексты интерфейса — `lib/i18n/ru.ts` (плоский объект строк), не хардкодятся в компонентах.

## Модель доступа
Два слоя защиты (план). 1) App-layer (готово): весь доступ к БД идёт через server-only
слой `lib/db/queries/*`, который ВСЕГДА фильтрует по `userId` из серверной сессии
Neon Auth (`auth.getSession()`). Клиент в БД напрямую не ходит, мутации — только
Server Actions и вебхук. 2) RLS (Neon RLS / neon_authorize, policy `user_id = auth.user_id()`)
— пока НЕ настроен (требует включения в консоли Neon), см. decisions.md.
См. decisions (ГРАБЛЯ про userId — RLS не освобождает от фильтрации в коде).

## Схема БД (детали в drizzle/schema.ts)
- users — управляется Neon Auth в схеме neon_auth (таблица "user": id uuid, email, ...).
  Свои таблицы хранят user_id (ссылка на этот id); FK-целостность — по возможности.
- categories: id, user_id, name, kind (expense|income), icon, color, sort_order, is_default,
  unique(user_id, name). При первом входе (в signIn-экшене) сидятся 8 дефолтных категорий
  расходов через onConflictDoNothing (защита от гонки при параллельных первых входах).
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
- /api/auth/[...path] — прокси-роут Neon Auth (sign-up/sign-in/сброс/сессии).
  Свои страницы: /auth/sign-in, /auth/sign-up, /auth/verify-email (Server Actions
  на auth.signIn/signUp/signOut).
- POST /api/telegram/webhook — приём апдейтов Telegram. Защита: secret_token в заголовке
  (X-Telegram-Bot-Api-Secret-Token). Обрабатывает `/start <token>` (привязка) и
  сообщения вида "кофе 200" (парс → категория → транзакция → ответ ботом).

## Флоу
- auth: регистрация не создаёт сессию — Neon Auth требует подтверждения email,
  после signUp редирект на /auth/verify-email. Логин/сброс пароля ведёт Neon Auth;
  при успешном signIn — сид 8 дефолтных категорий (в самом signIn-экшене, один раз,
  не на каждый заход). Proxy (`src/proxy.ts`) защищает всё, кроме публичных путей
  (`/`, `/health`, `/auth/*`, `/api/*`, статика) — секьюрно по умолчанию, новые
  страницы под `(app)` не нужно отдельно вписывать в matcher. Layout группы `(app)`
  — вторая, авторитетная проверка (redirect, если сессии нет).
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
- NEON_AUTH_BASE_URL — Auth URL проекта Neon Auth (консоль → Auth → Configuration).
- NEON_AUTH_COOKIE_SECRET — секрет для подписи сессионной cookie (openssl rand -base64 32).
- TELEGRAM_BOT_TOKEN — токен бота.
- TELEGRAM_WEBHOOK_SECRET — секрет для проверки заголовка вебхука.
- NEXT_PUBLIC_APP_URL — публичный URL (для формирования deep-link на бота).
