export type View = 'today' | 'journals' | 'threads' | 'tasks' | 'search';

export type ThreadStatus = 'active' | 'later' | 'resolved' | 'dropped';
export type TaskStatus = 'open' | 'done' | 'dropped';

export type Dump = {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  /** Threads touched in this dump. */
  threadIds: string[];
};

export type Journal = {
  dumps: Dump[];
};

/** Activity on a thread — writing, status, tasks, revisits. */
export type ThreadEventKind =
  | 'started'
  | 'thinking'
  | 'decision'
  | 'status'
  | 'task_added'
  | 'task_done'
  | 'task_dropped'
  | 'task_reopened'
  | 'revisited'
  | 'linked';

export type ThreadEvent = {
  id: string;
  kind: ThreadEventKind;
  content: string;
  createdAt: string;
  date: string;
  taskId?: string;
  fromStatus?: ThreadStatus;
  toStatus?: ThreadStatus;
};

export type Thread = {
  id: string;
  title: string;
  status: ThreadStatus;
  createdAt: string;
  updatedAt: string;
  events: ThreadEvent[];
};

export type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  threadId?: string;
  createdAt: string;
  updatedAt?: string;
};

export type AppState = {
  journals: Record<string, Journal>;
  threads: Thread[];
  tasks: Task[];
};

export type SearchResult = {
  kind: 'thread' | 'task' | 'decision' | 'note' | 'dump';
  title: string;
  excerpt: string;
  date: string;
  threadId?: string;
  targetId?: string;
};

export const VIEWS: View[] = ['today', 'journals', 'threads', 'tasks', 'search'];

export const VIEW_LABELS: Record<View, string> = {
  today: 'Today',
  journals: 'Journals',
  threads: 'Threads',
  tasks: 'Tasks',
  search: 'Search',
};

export const emptyJournal = (): Journal => ({ dumps: [] });

/** Placeholder dump: no writing and no linked threads. */
export const isEmptyDump = (dump: Dump): boolean =>
  !dump.content.trim() && dump.threadIds.length === 0;

export const journalThreadIds = (journal: Journal): string[] =>
  [...new Set(journal.dumps.flatMap((dump) => dump.threadIds))];
