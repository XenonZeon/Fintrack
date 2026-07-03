# Решения и грабли

Формат единый: Дата | Решение или грабля | Причина

2026-07-02 | Монолит Next.js (App Router), не фронт+бэк раздельно | один разработчик + ИИ-агенты, один деплой на Vercel, общие типы, вебхук как route handler
2026-07-02 | БД Neon, не Supabase | Supabase free ставит проект на паузу после 7 дней простоя; Neon auto-resume из scale-to-zero снимает эту боль. Цена: нет встроенных Auth/RLS (см. ниже)
2026-07-03 | ГРАБЛЯ: Neon Auth перешёл на @neondatabase/neon-js (Better Auth), классический Stack Auth (@stackframe/stack) в консоли больше не выдаётся (только Auth URL + JWKS URL) | решение от 2026-07-02 устарело за сутки; переписан auth-слой под auth.getSession()/signIn/signUp/signOut из @neondatabase/neon-js, email-верификация обязательна перед входом (проверено сквозным sign-up/sign-in)
2026-07-02 | Neon Auth, email+пароль | управляемый auth: логин/сессии/сброс пароля/верификация email — платформой, минимум кода и меньше риска дыр. Цена (принята): lock-in в Neon Auth. Пользователи синкаются в neon_auth.users_sync, к ним FK-ятся наши таблицы
2026-07-02 | Изоляция: app-layer фильтр по userId + RLS (Neon RLS/neon_authorize) вторым слоем | Neon Auth даёт JWT → auth.user_id() в Postgres, как auth.uid() в Supabase; RLS как defense-in-depth на случай бага в коде
2026-07-03 | RLS (neon_authorize) пока не настроен, только app-layer фильтр по userId | настройка RLS требует доверия к JWKS в консоли Neon (отдельный шаг); добавить отдельной задачей до продакшена
2026-07-02 | Мутации из веба через Server Actions, REST только для Telegram | меньше boilerplate, типобезопасно; внешнему боту нужен HTTP-эндпоинт
2026-07-02 | Деньги — integer-копейки (amount_minor), одна валюта RUB | точная арифметика без float; мультивалюта не в ТЗ
2026-07-02 | Категории — per-user, сид 8 дефолтов при регистрации | изоляция по user_id единообразна, позволяет кастомизацию в Фазе 2
2026-07-02 | Платежей нет | по брифу — личный проект
2026-07-02 | Telegram-вебхук, не long-polling | serverless на Vercel не держит постоянный процесс; вебхук — стандарт
2026-07-02 | ГРАБЛЯ: любой запрос к transactions/categories ОБЯЗАН фильтроваться по userId из серверной сессии | RLS — второй слой, не замена; клиент в БД не ходит
