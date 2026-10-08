# On My Mind List

A calm, private place to get things out of your head — think them through, remember what you decided, act when an action is right, and intentionally let the rest go.

Short name in the UI: **OnMyMind**.

Vite + React + TypeScript + Tailwind. Sign in with a username and password; your data is stored in Supabase (Postgres) so you can use it from any device.

**Live site:** [https://shakhi95.github.io/OnMyMind/](https://shakhi95.github.io/OnMyMind/)  
Pushes to `main` rebuild and redeploy via GitHub Actions → GitHub Pages (see [Deploy](#deploy)).

---

## Why this app exists

Most “productivity” tools assume everything is a task, a project, or a deadline. Real mental load is messier:

- worries and unfinished conversations
- decisions you haven’t made yet
- ideas that keep coming back
- things you already thought about and forgot *why*
- actions that are clear (“buy toothpaste”) and topics that aren’t (“should I move?”)

**OnMyMind** is a private thinking system, not a todo board.

Its job is to reduce cognitive load by giving whatever is occupying your mind a trustworthy external place — without forcing you to classify it before you write.

Guiding ideas:

- Capture first; organize only when something stands out.
- Thinking is valuable even when it produces no task.
- Dropping something is not failure.
- If a topic returns later, continue the same topic instead of duplicating it.

---

## Who it’s for

Someone who wants a quiet personal notebook for their mind — on a laptop or phone — with a private account so writing follows them across devices.

It is **not** for teams, shared projects, calendars, or kanban-style project management.

---

## How to use it (mental model)

Two entry paths:

```text
                  OnMyMind
                       │
         ┌─────────────┴─────────────┐
         ▼                           ▼
      TODAY / JOURNAL            QUICK TASK
   (dump what's here)         (you already know
         │                     the action)
         ▼
   LINK A TOPIC (optional)
         │
         ▼
   THINK · DECIDE · ACT · LATER · DROP
```

### Core concepts

| Concept | What it is |
| --- | --- |
| **Dump** | Free writing in today’s journal. No structure required. Empty dumps are not saved. |
| **Topic** | Something on your mind you may return to across days (active / later / resolved / dropped). |
| **Note** | Open writing on a topic (timeline). |
| **Decision** | A marked outcome of thinking, kept in history. |
| **Task** | A concrete action — standalone or attached to a topic (`open` / `done` / `dropped`). |
| **Journal day** | A day you wrote dumps and/or had notes, decisions, or task activity. |

**Thought** as a separate entity was removed. Dumps link directly to topics.

### Typical day

1. Open **Today** and dump whatever is on your mind.
2. If something stands out, **Link a topic** (new or from past — any status becomes active again).
3. Open the topic to add notes, decisions, and actions.
4. Use **⌘/Ctrl+K** when you already know a task and don’t need a dump first.
5. Browse **Journals** to see what a past day looked like.
6. Use **Search** (`/`) to find old writing.

---

## Run it

### Supabase (once)

1. Create a project (or use an existing one).
2. **Authentication → Providers → Email**: enabled; turn **Confirm email OFF**.
3. **Authentication → URL Configuration**: Site URL `https://shakhi95.github.io/OnMyMind/`; add redirect URLs `http://127.0.0.1:5173/**` and `https://shakhi95.github.io/OnMyMind/**`.
4. **SQL Editor**: paste and run [`supabase/schema.sql`](supabase/schema.sql).
5. **Project Settings → API Keys**: copy **Project URL** and the **Publishable key** (browser-safe with RLS). Do **not** put a **Secret key** in the app.

Forgot password for a user: **Authentication → Users** → set/reset password (UI usernames map to `username@onmymind.local`).

### Local app

```sh
cp .env.example .env
# fill VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY

npm install
npm run dev
```

Open the URL Vite prints (bound to `127.0.0.1`). Sign up or sign in with a username and password.

```sh
npm run build    # production build
npm run preview  # preview the build
```

**Export your data** / **Import backup** for JSON backups (import overwrites your cloud state). On mobile, open the ⋯ menu in the top bar.  
**Sign out** returns you to the login screen.

---

## Deploy

Hosted on **GitHub Pages** from this repo. Workflow: [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

How it works:

1. Push (or merge) to `main`.
2. Actions runs `npm ci` → `npm run build` (with Supabase env secrets).
3. Uploads `dist/` and deploys to Pages.
4. App is at `https://shakhi95.github.io/OnMyMind/`.

`vite.config.ts` sets `base: '/OnMyMind/'` so JS/CSS URLs match that path. Hash routes (`#/today`, …) work without a server rewrite.

**One-time repo secrets** (Settings → Secrets and variables → Actions):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY` (the Publishable key from the dashboard — not a Secret key)

**One-time repo setting** (if Pages is not on yet):

1. Open [Settings → Pages](https://github.com/shakhi95/OnMyMind/settings/pages).
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. Push to `main` (or run the workflow manually under Actions).

Manual redeploy: Actions → **Deploy to GitHub Pages** → **Run workflow**.

Local preview of the Pages build:

```sh
npm run build && npm run preview
```

Then open the preview URL Vite prints (still uses `/OnMyMind/` asset paths).

---

## Privacy & data

- Username/password login (Supabase Auth). Each account only sees its own row via RLS.
- App state (journals, topics, tasks) is stored as JSON in Supabase `user_data` (see below).
- Not end-to-end encrypted. Trust your Supabase project and password hygiene.
- Empty dumps (no text, no linked topics) are pruned on save/export so placeholders don’t clutter history.

Export regularly if the writing matters.

### Data storage & future migration

Each account stores journals, topics, and tasks as **one JSON document** per user (`user_data.state`). That is intentional for V1: simple sync, and enough for a few mid-heavy users for a long time.

**This is not a dead end.** Moving to relational tables later does **not** require throwing away user data. A migration would:

1. Snapshot / export `user_data` (or ask users to use **Export your data**).
2. Read each `state` blob and insert rows into tables (dumps, topics, events, tasks).
3. Deploy the app that reads/writes tables.
4. Keep the old blob as backup briefly, then drop it.

Risks to avoid at cutover: shipping table-only code before migrating rows, or deleting `user_data` without a backup. Export JSON remains the portable backup format either way.

Revisit splitting when exports are multi‑MB or saves feel slow on mobile data — not before.

---

## What’s already implemented

### Capture & journal

- Today: multiple timed dumps; autosave as you type
- Link new or past topics from a dump (pulling any status back to **active**)
- Write again only when there is no empty placeholder dump
- Delete dump via in-app confirm modal (topics are kept)
- Empty dumps never appear in Journals and are not persisted
- Journals: day list + day detail (dumps, linked topics, notes/decisions, short task activity including standalone tasks)

### Topics

- Statuses: active, later, resolved, dropped (tabs on Topics)
- Topic page: notes, decisions, actions, timeline with muted kind chips, status controls
- Bring into today’s journal (revisit)
### Tasks

- Quick add (`⌘/Ctrl+K`) — optional topic link
- Standalone or topic-linked
- Tasks view tabs: open / done / dropped
- Task events show on topic timelines and journal day digests

### App shell

- Dark theme, desktop sidebar + mobile bottom nav
- Search across topics, dumps, notes, decisions, tasks
- Hash routes (`#/today`, `#/journals/:day`, `#/topics/:id`, …)
- Toast feedback; custom confirm modals (no browser `alert`/`confirm`)

### Technical

- Vite + React 19 + TypeScript + Tailwind 4
- Domain types in `src/types.ts`
- Auth + cloud AppState via Supabase (`src/hooks/useAuth.ts`, `src/storage/supabaseState.ts`)
- Prune / export / import helpers in `src/storage/storage.ts`
- Shared modal chrome, kind chips, UI class helpers

---

## What’s next

Ordered by product value (not a commitment to build everything):

1. **Focus helper** — on a topic: next open action + recent progress, without becoming a dashboard.
2. **Gentle resurfacing** — optionally surface topics not touched in a while (never guilt language).
3. **Richer export** — Markdown / readable archive alongside JSON.
4. **Optional reminders** — only if explicitly requested by the user.
5. **Tests** — at least smoke tests for storage prune, journal digests, and topic/task status flows.

Explicitly **not planned as core**: AI that silently edits your data, team sharing, kanban, streaks, analytics dashboards, OAuth, calendar integrations.

---

## Keyboard

| Shortcut | Action |
| --- | --- |
| `⌘/Ctrl + K` | Quick add task |
| `/` | Search (when not typing in a field) |
| `Esc` | Close modal |

---

## Code map

```text
src/App.tsx                 Auth gate, routing, confirms, view switch
src/types.ts                Domain model (Dump, Journal, Topic, Task, …)
src/styles.css              Theme tokens + select/modal helpers
src/lib/                    Dates, ids, search, journals, events, supabase client
src/storage/storage.ts      Prune / export / import
src/storage/supabaseState.ts Cloud load / upsert of AppState
supabase/schema.sql         user_data table + RLS + signup trigger
src/hooks/                  Auth, app data, hash route, session tabs
src/components/             Modals, chips, dump editor, shared chrome
src/views/                  Login, Today, Journals, Topics, Tasks, Search, Topic detail
```

---

## Product success (how to judge it)

The app works if you can:

1. Dump quickly without deciding “what type” something is.
2. Think without being interrupted by structure.
3. Continue an old topic instead of reinventing it.
4. Record decisions and still see them later.
5. Create a task directly when the action is already clear.
6. Postpone or drop without shame.
7. Look back at a day and understand what was on your mind.
8. Trust that writing won’t vanish on a refresh (once saved to your account).

---

## Known limits

- Online required after login (no offline mode)
- Last write wins across devices (no realtime multi-tab sync)
- Journal days use the browser’s local calendar date
- No automated test suite yet
