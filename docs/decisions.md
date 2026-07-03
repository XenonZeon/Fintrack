# Решения и грабли

Формат единый: Дата | Решение или грабля | Причина

2026-07-02 | Монолит Next.js (App Router), не фронт+бэк раздельно | один разработчик + ИИ-агенты, один деплой на Vercel, общие типы, вебхук как route handler
2026-07-02 | БД Neon, не Supabase | Supabase free ставит проект на паузу после 7 дней простоя; Neon auto-resume из scale-to-zero снимает эту боль. Цена: нет встроенных Auth/RLS (см. ниже)
2026-07-03 | ГРАБЛЯ: Neon Auth перешёл на @neondatabase/neon-js (Better Auth), классический Stack Auth (@stackframe/stack) в консоли больше не выдаётся (только Auth URL + JWKS URL) | решение от 2026-07-02 устарело за сутки; переписан auth-слой под auth.getSession()/signIn/signUp/signOut из @neondatabase/neon-js, email-верификация обязательна перед входом (проверено сквозным sign-up/sign-in)
2026-07-02 | Neon Auth, email+пароль | управляемый auth: логин/сессии/сброс пароля/верификация email — платформой, минимум кода и меньше риска дыр. Цена (принята): lock-in в Neon Auth. Пользователи хранятся в neon_auth."user" (Better Auth), к ним FK-ятся наши таблицы
2026-07-02 | Изоляция: app-layer фильтр по userId + RLS (Neon RLS/neon_authorize) вторым слоем | Neon Auth даёт JWT → auth.user_id() в Postgres, как auth.uid() в Supabase; RLS как defense-in-depth на случай бага в коде
2026-07-03 | RLS (neon_authorize) пока не настроен, только app-layer фильтр по userId | настройка RLS требует доверия к JWKS в консоли Neon (отдельный шаг); добавить отдельной задачей до продакшена
2026-07-02 | Мутации из веба через Server Actions, REST только для Telegram | меньше boilerplate, типобезопасно; внешнему боту нужен HTTP-эндпоинт
2026-07-02 | Деньги — integer-копейки (amount_minor), одна валюта RUB | точная арифметика без float; мультивалюта не в ТЗ
2026-07-02 | Категории — per-user, сид 8 дефолтов при первом входе (в signIn-экшене, не при регистрации) | регистрация не создаёт сессию, пока email не подтверждён; изоляция по user_id единообразна, позволяет кастомизацию в Фазе 2
2026-07-03 | Категории: unique(user_id, name) + onConflictDoNothing в сидировании | защита от гонки — два параллельных первых входа не должны создавать дубли дефолтных категорий
2026-07-02 | Платежей нет | по брифу — личный проект
2026-07-02 | Telegram-вебхук, не long-polling | serverless на Vercel не держит постоянный процесс; вебхук — стандарт
2026-07-02 | ГРАБЛЯ: любой запрос к transactions/categories ОБЯЗАН фильтроваться по userId из серверной сессии | RLS — второй слой, не замена; клиент в БД не ходит
2026-07-03 | transactions.category_id — nullable | доходу категория не нужна (по требованию пользователя), описание идёт через comment; категория обязательна только когда type=expense (проверка в Server Action, не в схеме БД)
2026-07-03 | ГРАБЛЯ: auth.getSession() сразу после auth.signIn.email() в одном server action возвращает пустую сессию | signIn ставит cookie в ответ, но getSession в том же запросе читает входящие cookie — их ещё нет. Фикс: брать userId из data.user результата signIn, не дергать getSession повторно
2026-07-03 | ГРАБЛЯ: proxy.ts должен пропускать запросы с заголовком Next-Action без проверки сессии | Server Actions шлют POST на текущий URL страницы; если middleware редиректит такой запрос на /auth/sign-in, ломается протокол React Server Actions ("unexpected response"). Каждый Server Action и так проверяет сессию сам через auth.getSession()
2026-07-03 | formatRub округляет отрицательные и положительные суммы симметрично (не через голый Math.round) | Math.round(-1234.5) = -1234, но Math.round(1234.5) = 1235 — расход и остаток для одной и той же суммы показывали бы разные цифры
