# Плейлисти

Вебзастосунок для створення текстових плейлистів і обміну ними за посиланням. Специфікація — [#1](https://github.com/VelHRH/playlists-project/issues/1).

## Стек

Next.js (App Router) + TypeScript, Tailwind CSS, Drizzle ORM + PostgreSQL, Vitest, Playwright.

## Локальний запуск

Потрібні Node.js 22, pnpm 10 і Docker.

```bash
pnpm install
cp .env.example .env
docker compose up -d --wait
pnpm db:migrate
pnpm dev
```

Застосунок відкривається на http://localhost:3000.

Postgres слухає порт `54329` і містить три бази: `playlists` для розробки, `playlists_test` для Vitest і `playlists_e2e` для Playwright.

## Змінні оточення

| Змінна | Призначення |
| --- | --- |
| `DATABASE_URL` | Підключення до бази застосунку |
| `BETTER_AUTH_URL` | Публічна адреса застосунку (локально `http://localhost:3000`) |
| `BETTER_AUTH_SECRET` | Секрет для підпису сесій; згенеруйте `openssl rand -base64 32` |
| `TEST_DATABASE_URL` | Підключення до бази для Vitest (за замовчуванням `postgres://postgres:postgres@localhost:54329/playlists_test`) |
| `E2E_DATABASE_URL` | Підключення до бази для Playwright (за замовчуванням `postgres://postgres:postgres@localhost:54329/playlists_e2e`); перед прогоном вона створюється за потреби, мігрується й очищується |
| `RESEND_API_KEY` | API-ключ [Resend](https://resend.com) для відправки листів (скидання пароля). Обов'язковий у продакшні; без нього в режимі розробки листи виводяться в консоль сервера |
| `MAIL_FROM` | Адреса відправника, наприклад `Плейлисти <noreply@your-domain.com>`; потрібна разом із `RESEND_API_KEY`. Домен має бути підтверджений у Resend (для розробки підходить `onboarding@resend.dev`) |
| `MAIL_OUTBOX_DIR` | Каталог, куди листи записуються як JSON замість відправки; має пріоритет над Resend. Використовується лише в e2e |
| `E2E_MAIL_OUTBOX_DIR` | Каталог збирача листів для Playwright (за замовчуванням `<tmp>/playlists-e2e-outbox`); очищується перед прогоном |
| `AUTH_RATE_LIMIT_DISABLED` | `true` вимикає обмеження частоти входу; використовується лише в e2e. Без нього обмеження діє в продакшн-режимі |

## Скрипти

| Команда | Що робить |
| --- | --- |
| `pnpm dev` | Dev-сервер |
| `pnpm build` / `pnpm start` | Продакшн-збірка і запуск |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | Генерація типів маршрутів і `tsc --noEmit` |
| `pnpm test` | Vitest проти справжнього Postgres (міграції застосовуються автоматично, база очищується перед кожним тестом) |
| `pnpm test:e2e` | Playwright (десктоп і мобільний Chromium); перед першим запуском — `pnpm exec playwright install chromium` |
| `pnpm db:generate` | Згенерувати міграцію зі змін у схемі |
| `pnpm db:migrate` | Застосувати міграції до `DATABASE_URL` |

## CI

GitHub Actions на кожен PR і push у `main`: lint, typecheck, Vitest (з Postgres-сервісом), build і Playwright.
