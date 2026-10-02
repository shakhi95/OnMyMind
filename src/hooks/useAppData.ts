import { useCallback, useEffect, useState } from 'react';
import { dayKey } from '../lib/dates';
import { makeId } from '../lib/ids';
import {
  appendEvents,
  makeEvent,
  STATUS_LABELS,
  taskEventContent,
  taskEventKind,
} from '../lib/threadEvents';
import {
  exportState,
  loadState,
  parseImportPayload,
  saveState,
} from '../storage/storage';
import { emptyJournal } from '../types';
import { buildSampleState } from '../seed/sampleData';
import type { AppState, Journal, TaskStatus, Thread, ThreadEventKind, ThreadStatus } from '../types';

function mapDump(
  journal: Journal,
  dumpId: string,
  change: (dump: Journal['dumps'][number]) => Journal['dumps'][number],
): Journal {
  return {
    dumps: journal.dumps.map((dump) => (dump.id === dumpId ? change(dump) : dump)),
  };
}

function threadWithStarted(
  id: string,
  title: string,
  now: string,
  extra: ReturnType<typeof makeEvent>[] = [],
): Thread {
  return {
    id,
    title,
    status: 'active',
    createdAt: now,
    updatedAt: now,
    events: [
      makeEvent('started', 'Thread started', { createdAt: now, date: dayKey(new Date(now)) }),
      ...extra,
    ],
  };
}

export function useAppData() {
  const [data, setData] = useState<AppState>(loadState);
  const [saved, setSaved] = useState(true);
  const [saveError, setSaveError] = useState(false);
  const [toast, setToast] = useState('');
  const today = dayKey();

  useEffect(() => {
    setSaved(false);
    const timer = window.setTimeout(() => {
      const ok = saveState(data);
      setSaved(ok);
      setSaveError(!ok);
    }, 250);
    const flush = () => {
      saveState(data);
    };
    window.addEventListener('pagehide', flush);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('pagehide', flush);
    };
  }, [data]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 2300);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const changeJournal = useCallback(
    (change: (current: Journal) => Journal) => {
      setData((current) => ({
        ...current,
        journals: {
          ...current.journals,
          [today]: change(current.journals[today] || emptyJournal()),
        },
      }));
    },
    [today],
  );

  const addDump = useCallback(() => {
    const now = new Date().toISOString();
    changeJournal((current) => ({
      dumps: [
        ...current.dumps,
        { id: makeId(), content: '', createdAt: now, updatedAt: now, threadIds: [] },
      ],
    }));
  }, [changeJournal]);

  const updateDump = useCallback(
    (id: string, content: string) => {
      const now = new Date().toISOString();
      changeJournal((current) => ({
        dumps: current.dumps.map((dump) =>
          dump.id === id ? { ...dump, content, updatedAt: now } : dump,
        ),
      }));
    },
    [changeJournal],
  );

  const removeDump = useCallback(
    (id: string) => {
      changeJournal((current) => ({
        dumps: current.dumps.filter((dump) => dump.id !== id),
      }));
    },
    [changeJournal],
  );

  const addTask = useCallback(
    (title: string, threadId?: string) => {
      const now = new Date().toISOString();
      const taskId = makeId();
      const trimmed = title.trim();
      setData((current) => ({
        ...current,
        tasks: [{ id: taskId, title: trimmed, status: 'open', threadId, createdAt: now }, ...current.tasks],
        threads: threadId
          ? current.threads.map((thread) =>
              thread.id === threadId
                ? appendEvents(
                    thread,
                    makeEvent('task_added', trimmed, { createdAt: now, date: today, taskId }),
                  )
                : thread,
            )
          : current.threads,
      }));
      setToast('Saved. One less thing to remember.');
    },
    [today],
  );

  const addThread = useCallback((title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    const now = new Date().toISOString();
    const thread = threadWithStarted(makeId(), trimmed, now);
    setData((current) => ({
      ...current,
      threads: [thread, ...current.threads],
    }));
    setToast('A thread to return to, whenever you need it.');
    return thread.id;
  }, []);

  const setTaskStatus = useCallback(
    (id: string, status: TaskStatus) => {
      setData((current) => {
        const task = current.tasks.find((item) => item.id === id);
        const now = new Date().toISOString();
        const kind = taskEventKind(status);
        return {
          ...current,
          tasks: current.tasks.map((item) => (item.id === id ? { ...item, status, updatedAt: now } : item)),
          threads:
            task?.threadId && kind
              ? current.threads.map((thread) =>
                  thread.id === task.threadId
                    ? appendEvents(
                        thread,
                        makeEvent(kind, taskEventContent(status, task.title), {
                          createdAt: now,
                          date: today,
                          taskId: task.id,
                        }),
                      )
                    : thread,
                )
              : current.threads,
        };
      });
    },
    [today],
  );

  const linkThreadToDump = useCallback(
    (dumpId: string, threadId: string) => {
      const now = new Date().toISOString();
      let message: string | null = null;
      setData((current) => {
        const thread = current.threads.find((item) => item.id === threadId);
        const page = current.journals[today] || emptyJournal();
        const dump = page.dumps.find((item) => item.id === dumpId);
        if (!thread || !dump) return current;
        if (dump.threadIds.includes(threadId)) {
          message = 'Already linked to this dump.';
          return current;
        }

        const fromStatus = thread.status;
        const nextStatus: ThreadStatus = 'active';
        const events = [
          makeEvent('revisited', 'Linked from today’s dump', { createdAt: now, date: today }),
        ];
        if (nextStatus !== fromStatus) {
          events.push(
            makeEvent('status', STATUS_LABELS[nextStatus], {
              createdAt: now,
              date: today,
              fromStatus,
              toStatus: nextStatus,
            }),
          );
        }

        message = 'Thread linked to this dump.';
        return {
          ...current,
          journals: {
            ...current.journals,
            [today]: mapDump(page, dumpId, (item) => ({
              ...item,
              updatedAt: now,
              threadIds: [...item.threadIds, threadId],
            })),
          },
          threads: current.threads.map((item) =>
            item.id === threadId ? appendEvents({ ...item, status: nextStatus }, ...events) : item,
          ),
        };
      });
      if (message) setToast(message);
    },
    [today],
  );

  const createThreadOnDump = useCallback(
    (dumpId: string, title: string) => {
      const trimmed = title.trim();
      if (!trimmed) return;
      const now = new Date().toISOString();
      const thread = threadWithStarted(makeId(), trimmed, now, [
        makeEvent('linked', 'Started from today’s dump', { createdAt: now, date: today }),
      ]);
      setData((current) => {
        const page = current.journals[today] || emptyJournal();
        return {
          ...current,
          threads: [thread, ...current.threads],
          journals: {
            ...current.journals,
            [today]: mapDump(page, dumpId, (dump) => ({
              ...dump,
              updatedAt: now,
              threadIds: [...dump.threadIds, thread.id],
            })),
          },
        };
      });
      setToast('A thread to return to, whenever you need it.');
      return thread.id;
    },
    [today],
  );

  const unlinkThreadFromDump = useCallback(
    (dumpId: string, threadId: string) => {
      changeJournal((current) =>
        mapDump(current, dumpId, (dump) => ({
          ...dump,
          threadIds: dump.threadIds.filter((id) => id !== threadId),
          updatedAt: new Date().toISOString(),
        })),
      );
      setToast('Thread unlinked from this dump.');
    },
    [changeJournal],
  );

  const revisitThreadInJournal = useCallback(
    (threadId: string, dumpId?: string) => {
      let message: string | null = null;
      setData((current) => {
        const thread = current.threads.find((item) => item.id === threadId);
        const page = current.journals[today] || emptyJournal();
        if (!thread) return current;

        let dumps = page.dumps;
        let targetDumpId = dumpId || dumps[dumps.length - 1]?.id;
        if (!targetDumpId) {
          const now = new Date().toISOString();
          targetDumpId = makeId();
          dumps = [{ id: targetDumpId, content: '', createdAt: now, updatedAt: now, threadIds: [] }];
        }

        const targetDump = dumps.find((dump) => dump.id === targetDumpId);
        if (targetDump?.threadIds.includes(threadId)) {
          message = 'Already linked to this dump.';
          return current;
        }

        const now = new Date().toISOString();
        const fromStatus = thread.status;
        const nextStatus: ThreadStatus = 'active';
        const events = [
          makeEvent('revisited', 'Brought into today’s journal', { createdAt: now, date: today }),
        ];
        if (nextStatus !== fromStatus) {
          events.push(
            makeEvent('status', STATUS_LABELS[nextStatus], {
              createdAt: now,
              date: today,
              fromStatus,
              toStatus: nextStatus,
            }),
          );
        }

        message = 'Added to today’s journal.';
        return {
          ...current,
          journals: {
            ...current.journals,
            [today]: {
              dumps: dumps.map((dump) =>
                dump.id === targetDumpId
                  ? { ...dump, updatedAt: now, threadIds: [...dump.threadIds, threadId] }
                  : dump,
              ),
            },
          },
          threads: current.threads.map((item) =>
            item.id === threadId ? appendEvents({ ...item, status: nextStatus }, ...events) : item,
          ),
        };
      });
      if (message) setToast(message);
    },
    [today],
  );

  const updateThread = useCallback((id: string, change: (thread: Thread) => Thread) => {
    setData((current) => ({
      ...current,
      threads: current.threads.map((thread) => (thread.id === id ? change(thread) : thread)),
    }));
  }, []);

  const addNote = useCallback(
    (id: string, content: string, kind: Extract<ThreadEventKind, 'thinking' | 'decision'> = 'thinking') => {
      const now = new Date().toISOString();
      updateThread(id, (thread) =>
        appendEvents(thread, makeEvent(kind, content, { createdAt: now, date: today })),
      );
    },
    [today, updateThread],
  );

  const setThreadStatus = useCallback(
    (id: string, status: ThreadStatus) => {
      const now = new Date().toISOString();
      updateThread(id, (thread) => {
        if (thread.status === status) return thread;
        return appendEvents(
          { ...thread, status },
          makeEvent('status', STATUS_LABELS[status], {
            createdAt: now,
            date: today,
            fromStatus: thread.status,
            toStatus: status,
          }),
        );
      });
    },
    [today, updateThread],
  );

  const doExport = useCallback(() => {
    exportState(data, `on-my-mind-${today}.json`);
  }, [data, today]);

  const doImport = useCallback(async (file: File) => {
    const raw = await file.text();
    const next = parseImportPayload(raw);
    setData(next);
    setToast('Backup restored on this device.');
  }, []);

  const loadSampleData = useCallback(() => {
    setData(buildSampleState());
    setToast('Sample data loaded — explore Today, Journals, Threads, and Tasks.');
  }, []);

  const journal = data.journals[today] || emptyJournal();

  return {
    data,
    today,
    saved,
    saveError,
    toast,
    setToast,
    journal,
    activeThreads: data.threads
      .filter((thread) => thread.status === 'active')
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    openTasks: data.tasks.filter((task) => task.status === 'open'),
    addDump,
    updateDump,
    removeDump,
    addTask,
    addThread,
    setTaskStatus,
    linkThreadToDump,
    createThreadOnDump,
    unlinkThreadFromDump,
    revisitThreadInJournal,
    addNote,
    setThreadStatus,
    doExport,
    doImport,
    loadSampleData,
  };
}
