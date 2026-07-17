# crm-mini — Міні-CRM: список клієнтів з AI-нотатками

**Живе демо:** https://crm-mini-silk.vercel.app/

Повний застосунок (фронтенд + Supabase-бекенд) в одному репозиторії. Стек:
React 18 + Vite + TypeScript (strict) + Tailwind CSS + shadcn/ui-компоненти +
Supabase (PostgreSQL + Edge Functions) + React Router.

AI-аналіз нотаток працює через OpenAI-сумісний API (за замовчуванням OpenAI;
підтримуються також безкоштовні Groq та Google Gemini — провайдер задається
секретами `OPENAI_BASE_URL` / `OPENAI_MODEL` Edge Function, без змін у коді).

Бекенд-частина (SQL-міграція та Supabase Edge Function для AI-аналізу) — у теці
`supabase/` цього ж репозиторію.

## Функціонал

- Таблиця клієнтів (імʼя, компанія, телефон, email, статус-бейдж).
- Діалог додавання клієнта з валідацією (`react-hook-form` + `zod`).
- Сторінка клієнта `/clients/:id` зі списком нотаток і формою додавання.
- Кожна нотатка автоматично аналізується AI (резюме, теги, sentiment) через
  Supabase Edge Function — LLM-ключ ніколи не потрапляє на фронтенд.
- Безпечна обробка помилок AI/Supabase: невдалий AI-аналіз не блокує збереження
  нотатки, користувач бачить ненавʼязливий toast.

## 1. Встановлення

```bash
npm install
```

## 2. Налаштування Supabase

1. Створи проєкт на [supabase.com](https://supabase.com).
2. У SQL Editor виконай міграцію з `supabase/migrations/0001_init.sql`
   (створює таблиці `clients`, `notes`, RLS-політики).
3. Розгорни Edge Function `analyze-note` (див. розділ «Бекенд (Supabase)» нижче) —
   вона обробляє AI-аналіз нотаток.
4. Скопіюй `.env.example` у `.env` і заповни:

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Ці значення бери зі Supabase Dashboard → Project Settings → API. Секретний
LLM-ключ (OpenAI/Groq/Gemini) сюди НЕ додається — він живе лише як секрет
Edge Function (див. розділ «Бекенд (Supabase)»).

## 3. Запуск у розробці

```bash
npm run dev
```

Застосунок буде доступний на `http://localhost:5173`.

## 4. Перевірка типів і збірка

```bash
npm run typecheck
npm run build
npm run preview
```

## 5. Деплой на Vercel

1. Заведи новий проєкт на [vercel.com](https://vercel.com) з цього репозиторію.
2. Framework Preset: **Vite**. Build Command: `npm run build`, Output Directory: `dist`.
3. У Project Settings → Environment Variables додай:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Задеплой. Переконайся, що Edge Function `analyze-note` уже розгорнута в
   Supabase-проєкті — інакше AI-аналіз нотаток працюватиме з fallback (нотатка
   збережеться без AI-даних, з відповідним toast).

## 6. Бекенд (Supabase)

Уся бекенд-частина — у теці `supabase/`:

```
supabase/
  config.toml
  migrations/0001_init.sql          # таблиці clients, notes + RLS
  functions/analyze-note/index.ts   # Edge Function AI-аналізу (Deno)
```

### Деплой Edge Function

```bash
supabase login
supabase functions deploy analyze-note --project-ref your-project-ref
```

### Секрети (LLM-провайдер)

LLM API-ключ живе ЛИШЕ як секрет Edge Function і ніколи не потрапляє на фронтенд.
Функція провайдер-агностична — підтримує будь-який OpenAI-сумісний API.

Безкоштовний **Groq** (без картки, рекомендовано для тестового):

```bash
supabase secrets set OPENAI_API_KEY=gsk_... --project-ref your-project-ref
supabase secrets set OPENAI_BASE_URL=https://api.groq.com/openai/v1/chat/completions --project-ref your-project-ref
supabase secrets set OPENAI_MODEL=llama-3.3-70b-versatile --project-ref your-project-ref
```

Альтернативи: **OpenAI** (лишити `OPENAI_BASE_URL` порожнім, `OPENAI_MODEL=gpt-4o-mini`)
або **Google Gemini** (`OPENAI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/chat/completions`,
`OPENAI_MODEL=gemini-2.0-flash`).

### Перевірка функції

```bash
curl -X POST 'https://your-project-ref.supabase.co/functions/v1/analyze-note' \
  -H 'Content-Type: application/json' \
  -H 'apikey: your-anon-key' \
  -H 'Authorization: Bearer your-anon-key' \
  -d '{"text":"Клієнт дуже зацікавлений, великий бюджет, просив передзвонити."}'
```

Очікувано: `{"summary":"...","tags":["...","..."],"sentiment":"positive"}`.

## 7. Демо-дані (сидінг)

`seed.mjs` наповнює БД прикладами (10 клієнтів + нотатки), проганяючи кожну
нотатку через реальний AI-аналіз:

```bash
node seed.mjs   # бере VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY з .env або дефолти в скрипті
```

## UI/UX

- Загальний каркас — `src/components/layout/AppLayout.tsx`: верхній хедер з
  лого "Mini-CRM" та перемикачем теми, контент у центрованому контейнері на
  м'якому фоні (`bg-muted/30`), картки — `bg-card` з тінню.
- Світла/темна тема — CSS-змінні токенів у `src/index.css` (`:root` і `.dark`),
  перемикається кнопкою sun/moon у хедері через UI-хук `src/hooks/useTheme.ts`
  (зберігає вибір у `localStorage`, клас `.dark` на `<html>`). У `index.html`
  є інлайн-скрипт, що застосовує збережену тему до першого рендеру React —
  без "спалаху" світлої теми при завантаженні.
- Статуси клієнтів мають чіткі кольори: `new` — синій, `in_progress` —
  бурштиновий, `closed` — нейтральний сірий (`src/components/ui/badge.tsx`,
  варіанти `info`/`warning`/`secondary`).
- Аватар-ініціали клієнта (`src/components/clients/ClientAvatar.tsx`) —
  кольоровий кружечок з першими літерами імені, колір підбирається
  детерміновано за імʼям.
- Нотатки: кожна — картка з тонкою кольоровою смужкою зліва залежно від
  sentiment AI-аналізу; якщо AI-аналіз не вдався — замість порожнечі показано
  бейдж "AI-аналіз недоступний".

Усі ці зміни — виключно презентаційні: пропси хуків/компонентів, контракти
Supabase-запитів і AI-аналізу не змінювались.

## Структура проєкту

```
src/
  components/
    ui/            # shadcn/ui-компоненти (button, dialog, form, toast, ...)
    layout/        # AppLayout, ThemeToggle
    clients/       # ClientsTable, AddClientDialog, StatusBadge, ClientAvatar
    notes/         # NoteForm, NoteList, NoteItem, SentimentIndicator
  hooks/           # useClients, useClient, useNotes, useTheme (UI)
  lib/
    types.ts       # Client, Note, ClientStatus, Sentiment, NoteAiAnalysis
    supabase.ts    # Supabase-клієнт
    ai.ts          # Обгортка над Edge Function analyze-note
    validation.ts  # zod-схеми форм
    utils.ts       # cn() helper для Tailwind
  pages/
    ClientsListPage.tsx
    ClientDetailPage.tsx
  App.tsx
  main.tsx
```
