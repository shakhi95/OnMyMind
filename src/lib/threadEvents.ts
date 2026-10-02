import { dayKey } from './dates';
import { makeId } from './ids';
import type { TaskStatus, Thread, ThreadEvent, ThreadEventKind, ThreadStatus } from '../types';

export const STATUS_LABELS: Record<ThreadStatus, string> = {
  active: 'Brought back to active',
  later: 'Set aside for later',
  resolved: 'Marked resolved',
  dropped: 'Let go',
};

export function eventDay(event: ThreadEvent) {
  return event.date || event.createdAt.slice(0, 10);
}

/** Writing that shows up in journal day digests. */
export function isWritingEvent(event: ThreadEvent) {
  return event.kind === 'thinking' || event.kind === 'decision';
}

export function isTaskEvent(event: ThreadEvent) {
  return (
    event.kind === 'task_added' ||
    event.kind === 'task_done' ||
    event.kind === 'task_dropped' ||
    event.kind === 'task_reopened'
  );
}

export function makeEvent(
  kind: ThreadEventKind,
  content: string,
  extras: Partial<Pick<ThreadEvent, 'taskId' | 'fromStatus' | 'toStatus' | 'createdAt' | 'date' | 'id'>> = {},
): ThreadEvent {
  const createdAt = extras.createdAt || new Date().toISOString();
  return {
    id: extras.id || makeId(),
    kind,
    content,
    createdAt,
    date: extras.date || dayKey(new Date(createdAt)),
    ...(extras.taskId ? { taskId: extras.taskId } : {}),
    ...(extras.fromStatus ? { fromStatus: extras.fromStatus } : {}),
    ...(extras.toStatus ? { toStatus: extras.toStatus } : {}),
  };
}

export function appendEvents(thread: Thread, ...events: ThreadEvent[]): Thread {
  if (!events.length) return thread;
  const last = events[events.length - 1];
  return {
    ...thread,
    events: [...thread.events, ...events],
    updatedAt: last.createdAt,
  };
}

export function taskEventKind(status: TaskStatus): ThreadEventKind | null {
  if (status === 'done') return 'task_done';
  if (status === 'dropped') return 'task_dropped';
  if (status === 'open') return 'task_reopened';
  return null;
}

export function taskEventContent(status: TaskStatus, title: string) {
  if (status === 'done') return `Done · ${title}`;
  if (status === 'dropped') return `Dropped · ${title}`;
  return `Reopened · ${title}`;
}
