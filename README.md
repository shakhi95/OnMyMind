# On My Mind List

A calm, private place to get things out of your head — think them through, remember what you decided, act when an action is right, and intentionally let the rest go.

Short name in the UI: **On My Mind**.

This V1 is a single-user, local-first web app (Vite + React + TypeScript + Tailwind). No account. No server. Your data stays in the browser on this device.

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

**On My Mind** is a private thinking system, not a todo board.

Its job is to reduce cognitive load by giving whatever is occupying your mind a trustworthy external place — without forcing you to classify it before you write.

Guiding ideas:

- Capture first; organize only when something stands out.
- Thinking is valuable even when it produces no task.
- Dropping something is not failure.
- If a topic returns later, continue the same topic instead of duplicating it.

---

## Who it’s for

One person who wants a quiet personal notebook for their mind — on a laptop or phone — and is fine with data living locally in the browser for now.

It is **not** for teams, shared projects, calendars, or kanban-style project management.

---

## How to use it (mental model)

Two entry paths:

```text
                  ON MY MIND
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

```sh
npm install
npm run dev
```

Open the URL Vite prints (bound to `127.0.0.1`).

```sh
npm run build    # production build
npm run preview  # preview the build
```

Reset: clear this site’s local storage (export first if you care about the writing).  
**Export your data** / **Import backup** in the sidebar for JSON backups.  
**Load sample data** fills ~15 days of example dumps, topics, and tasks.

---

## Deploy

Hosted on **GitHub Pages** from this repo. Workflow: [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

How it works:

1. Push (or merge) to `main`.
2. Actions runs `npm ci` → `npm run build`.
3. Uploads `dist/` and deploys to Pages.
4. App is at `https://shakhi95.github.io/OnMyMind/`.

`vite.config.ts` sets `base: '/OnMyMind/'` so JS/CSS URLs match that path. Hash routes (`#/today`, …) work without a server rewrite.

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

- No login in this V1.
- Data is stored in `localStorage` under the key `on-my-mind`.
- Not encrypted. Not synced across devices.
- Anyone with access to the same browser profile can read it.
- Empty dumps (no text, no linked topics) are pruned on save/export so placeholders don’t clutter history.
- Topic note/decision drafts are stored separately until you submit them on the topic page.

Treat this like a private notebook on one device. Export regularly if the writing matters.

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
- Drafts for unsubmitted note/decision text

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
- Sample dataset for exploration

### Technical

- Vite + React 19 + TypeScript + Tailwind 4
- Domain types in `src/types.ts`
- Persistence + prune in `src/storage/storage.ts`
- Shared modal chrome, kind chips, UI class helpers

---

## What’s next

Ordered by product value (not a commitment to build everything):

1. **Accounts & sync** — secure auth + multi-device (e.g. Supabase + RLS). Local-first remains the mental model until then.
2. **Focus helper** — on a topic: next open action + recent progress, without becoming a dashboard.
3. **Gentle resurfacing** — optionally surface topics not touched in a while (never guilt language).
4. **Richer export** — Markdown / readable archive alongside JSON.
5. **Optional reminders** — only if explicitly requested by the user.
6. **Tests** — at least smoke tests for storage prune, journal digests, and topic/task status flows.

Explicitly **out of V1 / not planned as core**: AI that silently edits your data, team sharing, kanban, streaks, analytics dashboards, OAuth, calendar integrations.

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
src/App.tsx                 Shell: routing, confirms, view switch
src/types.ts                Domain model (Dump, Journal, Topic, Task, …)
src/styles.css              Theme tokens + select/modal helpers
src/lib/                    Dates, ids, search, journals digests, events, UI classes
src/storage/storage.ts      Load / save / export / import / drafts / prune
src/hooks/                  App data, hash route, session tabs
src/components/             Modals, chips, dump editor, shared chrome
src/views/                  Today, Journals, Topics, Tasks, Search, Topic detail
src/seed/sampleData.ts      Optional dense sample state
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
8. Trust that writing won’t vanish on a refresh (on this device).

---

## Known limits

- One browser profile; no cross-device sync yet
- Journal days use the browser’s local calendar date
- No automated test suite yet
- Spec file `OnMyMind.txt` described an earlier “Thought” model and full Supabase V1; this README reflects the **current** dump ↔ topic product
