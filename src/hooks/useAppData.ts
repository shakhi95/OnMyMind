import { useCallback, useEffect, useState } from 'react';
import { dayKey } from '../lib/dates';
import { makeId } from '../lib/ids';
import {
  appendEvents,
  makeEvent,
  STATUS_LABELS,
  taskEventContent,
  taskEventKind,
} from '../lib/topicEvents';
import {
  exportState,
  loadState,
  parseImportPayload,
  saveState,
} from '../storage/storage';
import { emptyJournal } from '../types';
import { buildSampleState } from '../seed/sampleData';
import type { AppState, Journal, TaskStatus, Topic, TopicEventKind, TopicStatus } from '../types';

function mapDump(
  journal: Journal,
  dumpId: string,
  change: (dump: Journal['dumps'][number]) => Journal['dumps'][number],
): Journal {
  return {
    dumps: journal.dumps.map((dump) => (dump.id === dumpId ? change(dump) : dump)),
  };
}

function topicWithStarted(
  id: string,
  title: string,
  now: string,
  extra: ReturnType<typeof makeEvent>[] = [],
): Topic {
  return {
    id,
    title,
    status: 'active',
    createdAt: now,
    updatedAt: now,
    events: [
      makeEvent('started', 'Topic started', { createdAt: now, date: dayKey(new Date(now)) }),
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
        { id: makeId(), content: '', createdAt: now, updatedAt: now, topicIds: [] },
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
    (title: string, topicId?: string) => {
      const now = new Date().toISOString();
      const taskId = makeId();
      const trimmed = title.trim();
      setData((current) => ({
        ...current,
        tasks: [{ id: taskId, title: trimmed, status: 'open', topicId, createdAt: now }, ...current.tasks],
        topics: topicId
          ? current.topics.map((topic) =>
              topic.id === topicId
                ? appendEvents(
                    topic,
                    makeEvent('task_added', trimmed, { createdAt: now, date: today, taskId }),
                  )
                : topic,
            )
          : current.topics,
      }));
      setToast('Saved. One less thing to remember.');
    },
    [today],
  );

  const addTopic = useCallback((title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    const now = new Date().toISOString();
    const topic = topicWithStarted(makeId(), trimmed, now);
    setData((current) => ({
      ...current,
      topics: [topic, ...current.topics],
    }));
    setToast('A topic to return to, whenever you need it.');
    return topic.id;
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
          topics:
            task?.topicId && kind
              ? current.topics.map((topic) =>
                  topic.id === task.topicId
                    ? appendEvents(
                        topic,
                        makeEvent(kind, taskEventContent(status, task.title), {
                          createdAt: now,
                          date: today,
                          taskId: task.id,
                        }),
                      )
                    : topic,
                )
              : current.topics,
        };
      });
    },
    [today],
  );

  const linkTopicToDump = useCallback(
    (dumpId: string, topicId: string) => {
      const now = new Date().toISOString();
      let message: string | null = null;
      setData((current) => {
        const topic = current.topics.find((item) => item.id === topicId);
        const page = current.journals[today] || emptyJournal();
        const dump = page.dumps.find((item) => item.id === dumpId);
        if (!topic || !dump) return current;
        if (dump.topicIds.includes(topicId)) {
          message = 'Already linked to this dump.';
          return current;
        }

        const fromStatus = topic.status;
        const nextStatus: TopicStatus = 'active';
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

        message = 'Topic linked to this dump.';
        return {
          ...current,
          journals: {
            ...current.journals,
            [today]: mapDump(page, dumpId, (item) => ({
              ...item,
              updatedAt: now,
              topicIds: [...item.topicIds, topicId],
            })),
          },
          topics: current.topics.map((item) =>
            item.id === topicId ? appendEvents({ ...item, status: nextStatus }, ...events) : item,
          ),
        };
      });
      if (message) setToast(message);
    },
    [today],
  );

  const createTopicOnDump = useCallback(
    (dumpId: string, title: string) => {
      const trimmed = title.trim();
      if (!trimmed) return;
      const now = new Date().toISOString();
      const topic = topicWithStarted(makeId(), trimmed, now, [
        makeEvent('linked', 'Started from today’s dump', { createdAt: now, date: today }),
      ]);
      setData((current) => {
        const page = current.journals[today] || emptyJournal();
        return {
          ...current,
          topics: [topic, ...current.topics],
          journals: {
            ...current.journals,
            [today]: mapDump(page, dumpId, (dump) => ({
              ...dump,
              updatedAt: now,
              topicIds: [...dump.topicIds, topic.id],
            })),
          },
        };
      });
      setToast('A topic to return to, whenever you need it.');
      return topic.id;
    },
    [today],
  );

  const unlinkTopicFromDump = useCallback(
    (dumpId: string, topicId: string) => {
      changeJournal((current) =>
        mapDump(current, dumpId, (dump) => ({
          ...dump,
          topicIds: dump.topicIds.filter((id) => id !== topicId),
          updatedAt: new Date().toISOString(),
        })),
      );
      setToast('Topic unlinked from this dump.');
    },
    [changeJournal],
  );

  const revisitTopicInJournal = useCallback(
    (topicId: string, dumpId?: string) => {
      let message: string | null = null;
      setData((current) => {
        const topic = current.topics.find((item) => item.id === topicId);
        const page = current.journals[today] || emptyJournal();
        if (!topic) return current;

        let dumps = page.dumps;
        let targetDumpId = dumpId || dumps[dumps.length - 1]?.id;
        if (!targetDumpId) {
          const now = new Date().toISOString();
          targetDumpId = makeId();
          dumps = [{ id: targetDumpId, content: '', createdAt: now, updatedAt: now, topicIds: [] }];
        }

        const targetDump = dumps.find((dump) => dump.id === targetDumpId);
        if (targetDump?.topicIds.includes(topicId)) {
          message = 'Already linked to this dump.';
          return current;
        }

        const now = new Date().toISOString();
        const fromStatus = topic.status;
        const nextStatus: TopicStatus = 'active';
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
                  ? { ...dump, updatedAt: now, topicIds: [...dump.topicIds, topicId] }
                  : dump,
              ),
            },
          },
          topics: current.topics.map((item) =>
            item.id === topicId ? appendEvents({ ...item, status: nextStatus }, ...events) : item,
          ),
        };
      });
      if (message) setToast(message);
    },
    [today],
  );

  const updateTopic = useCallback((id: string, change: (topic: Topic) => Topic) => {
    setData((current) => ({
      ...current,
      topics: current.topics.map((topic) => (topic.id === id ? change(topic) : topic)),
    }));
  }, []);

  const addNote = useCallback(
    (id: string, content: string, kind: Extract<TopicEventKind, 'thinking' | 'decision'> = 'thinking') => {
      const now = new Date().toISOString();
      updateTopic(id, (topic) =>
        appendEvents(topic, makeEvent(kind, content, { createdAt: now, date: today })),
      );
    },
    [today, updateTopic],
  );

  const setTopicStatus = useCallback(
    (id: string, status: TopicStatus) => {
      const now = new Date().toISOString();
      updateTopic(id, (topic) => {
        if (topic.status === status) return topic;
        return appendEvents(
          { ...topic, status },
          makeEvent('status', STATUS_LABELS[status], {
            createdAt: now,
            date: today,
            fromStatus: topic.status,
            toStatus: status,
          }),
        );
      });
    },
    [today, updateTopic],
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
    setToast('Sample data loaded — explore Today, Journals, Topics, and Tasks.');
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
    activeTopics: data.topics
      .filter((topic) => topic.status === 'active')
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    openTasks: data.tasks.filter((task) => task.status === 'open'),
    addDump,
    updateDump,
    removeDump,
    addTask,
    addTopic,
    setTaskStatus,
    linkTopicToDump,
    createTopicOnDump,
    unlinkTopicFromDump,
    revisitTopicInJournal,
    addNote,
    setTopicStatus,
    doExport,
    doImport,
    loadSampleData,
  };
}
