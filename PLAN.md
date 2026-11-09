# Receipt Accountant — Plan

> Your own personal accountant. Send photos of your receipts and it organizes them by category (food, transport, utilities…). At month end it tells you where your money went and where you can save.

## Goal
Snap/upload receipts → AI extracts merchant, date, total, category → dashboard of spending with a monthly AI report and savings tips.

## Core features (MVP)
1. **Receipt capture** — upload photo (web, mobile camera) or forward via Telegram/WhatsApp bot (later).
2. **AI extraction** — Claude vision reads the receipt: merchant, date, total, currency, line items, suggested category.
3. **Review & correct** — confirm/edit extracted data before saving.
4. **Dashboard** — income, expenses, monthly savings cards (vs. last month); donut chart of spending by category; savings goal progress ring; recent transactions table; recent receipts list with thumbnails.
5. **Manual entries** — add income and non-receipt expenses.
6. **Monthly report** — at month end, Claude analyses the month: top categories, changes vs. last month, 3 concrete saving tips ("Tip of the month" card).
7. **Categories & budgets** — editable categories with optional monthly limit.

## Later
- Telegram/WhatsApp bot for sending receipts.
- Bank CSV import, recurring subscription detection.
- Multi-currency, shared household budgets.

## Stack
| Layer | Choice |
|---|---|
| App | Next.js + TypeScript + Tailwind + shadcn/ui, Recharts for charts |
| Auth/DB/Storage | Supabase (Auth, Postgres, Storage bucket for receipt images) |
| AI | Claude API vision (`claude-sonnet-5-5`) with structured JSON output |
| Jobs | Vercel Cron, 1st of month → monthly report |
| Hosting | Vercel |

## Data model
- `categories(id, user_id, name, icon, color, monthly_budget)`
- `transactions(id, user_id, type[income|expense], amount, currency, date, merchant, description, category_id, receipt_id)`
- `receipts(id, user_id, image_path, raw_extraction jsonb, status[pending|confirmed])`
- `goals(id, user_id, month, target_amount)`
- `reports(id, user_id, month, content_md, tips jsonb)`

## Milestones
1. **Setup** — scaffold, dark theme, sidebar (Home, Income, Expenses, Receipts, Categories, Savings, Goals, Reports).
2. **Auth + data** — Supabase auth, categories seed, transactions CRUD.
3. **Receipt pipeline** — upload → storage → Claude extraction → review screen.
4. **Dashboard** — KPI cards, donut, goal ring, tables.
5. **Monthly report** — cron + prompt + reports page.
6. **Polish** — mobile camera capture, deploy.

## Risks
- OCR accuracy on crumpled/low-light receipts → always keep a human review step.
- Financial data is sensitive → RLS on every table, private storage bucket, signed URLs.
