export type View = 'today' | 'journals' | 'topics' | 'tasks' | 'search';

export type TopicStatus = 'active' | 'later' | 'resolved' | 'dropped';
export type TaskStatus = 'open' | 'done' | 'dropped';

export type Dump = {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  /** Topics touched in this dump. */
  topicIds: string[];
};

export type Journal = {
  dumps: Dump[];
};

/** Activity on a topic — writing, status, tasks, revisits. */
export type TopicEventKind =
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

export type TopicEvent = {
  id: string;
  kind: TopicEventKind;
  content: string;
  createdAt: string;
  date: string;
  taskId?: string;
  fromStatus?: TopicStatus;
  toStatus?: TopicStatus;
};

export type Topic = {
  id: string;
  title: string;
  status: TopicStatus;
  createdAt: string;
  updatedAt: string;
  events: TopicEvent[];
};

export type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  topicId?: string;
  createdAt: string;
  updatedAt?: string;
};

export type AppState = {
  journals: Record<string, Journal>;
  topics: Topic[];
  tasks: Task[];
};

export type SearchResult = {
  kind: 'topic' | 'task' | 'decision' | 'note' | 'dump';
  title: string;
  excerpt: string;
  date: string;
  topicId?: string;
  targetId?: string;
};

export const VIEWS: View[] = ['today', 'journals', 'topics', 'tasks', 'search'];

export const VIEW_LABELS: Record<View, string> = {
  today: 'Today',
  journals: 'Journals',
  topics: 'Topics',
  tasks: 'Tasks',
  search: 'Search',
};

export const emptyJournal = (): Journal => ({ dumps: [] });

/** Placeholder dump: no writing and no linked topics. */
export const isEmptyDump = (dump: Dump): boolean =>
  !dump.content.trim() && dump.topicIds.length === 0;

export const journalTopicIds = (journal: Journal): string[] =>
  [...new Set(journal.dumps.flatMap((dump) => dump.topicIds))];
