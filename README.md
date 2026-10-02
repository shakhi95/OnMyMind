# On My Mind List

A calm, private place to capture what is occupying your mind, think it through, remember what you decided, and take action when an action is right.

This V1 is a Vite + React + TypeScript app styled with Tailwind CSS. It needs no account or backend to run.

## Product purpose

On My Mind is a private thinking system, not a conventional task manager. Capture stays easy. Dump what's on your mind, link threads when something stands out, revisit threads, record thinking and decisions, and create a quick task without a journal entry first.

## Run it

```sh
npm install
npm run dev
```

Open the local URL Vite prints. Production build: `npm run build`. Reset by clearing this site's local storage. Use **Export your data** first if you want a backup; **Import backup** restores a previous JSON export.

## Authentication and privacy

There is no login in this V1. Single-user, local-first: `localStorage` holds journals, threads, and tasks on this device. Data is not encrypted and does not sync. Anyone with access to the same browser profile can read it. Export JSON backups regularly if the writing matters.

Supabase (auth, sync, RLS) is deferred on purpose.

## What works now

- Today's journal: multiple timed mind dumps; each dump can link threads (new or from past)
- Journals page: list of days → open a day for dumps, linked threads, and that day's thread notes/decisions
- Create a thread from a dump, or link an existing thread to a dump
- Revisit a previous thread into today (logged on today's journal)
- Dates show time (dumps, notes, journals, “last on your mind”)
- Thread notes, decisions, tasks, later / resolved / dropped
- Quick capture (`⌘/Ctrl+K`), search (`/`), JSON export and import
- Debounced local autosave and per-thread draft fields
- Dark responsive UI (sidebar on desktop, bottom nav on mobile)

## Code map

```text
src/App.tsx                 Shell: routing, layout, view switch
src/types.ts                Domain types
src/styles.css              Tailwind import + theme tokens only
src/lib/                    Dates, ids, search, DOM helpers
src/storage/storage.ts      Load / save / export / import / drafts
src/hooks/                  App data, hash route, outside-click
src/components/             Shared UI pieces
src/views/                  Today, Journals, Threads, Tasks, Search, Thread detail
```

## Known limits

- Local to one browser profile; no account or cross-device sync
- Journals keyed by the browser's local calendar date
- No automated tests yet (manual checklist recommended)
- Supabase auth / sync / RLS still pending
