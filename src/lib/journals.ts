import type { AppState, Dump, Task, Topic, TopicEvent } from '../types';
import { emptyJournal, isEmptyDump, journalTopicIds } from '../types';
import { eventDay, isTaskEvent, isWritingEvent } from './topicEvents';

export type DayTopicActivity = {
  topic: Topic;
  event: Topic['events'][number];
};

export type DayTaskActivity = {
  id: string;
  label: string;
  title: string;
  at: string;
  topicId?: string;
  topicTitle?: string;
};

export type JournalDaySummary = {
  date: string;
  dumpCount: number;
  topicLinkCount: number;
  topicActivityCount: number;
  taskActivityCount: number;
};

export type JournalDayDetail = {
  date: string;
  dumps: Dump[];
  linkedTopicIds: string[];
  topicActivity: DayTopicActivity[];
  taskActivity: DayTaskActivity[];
};

function dayOf(iso: string) {
  return iso.slice(0, 10);
}

function taskLabel(kind: TopicEvent['kind']): string {
  if (kind === 'task_done') return 'Done';
  if (kind === 'task_dropped') return 'Dropped';
  if (kind === 'task_reopened') return 'Reopened';
  return 'Added';
}

function standaloneTaskLines(task: Task, date: string): DayTaskActivity[] {
  const lines: DayTaskActivity[] = [];
  const createdDay = dayOf(task.createdAt);
  const updatedDay = task.updatedAt ? dayOf(task.updatedAt) : null;

  if (createdDay === date) {
    lines.push({
      id: `${task.id}-added`,
      label: 'Added',
      title: task.title,
      at: task.createdAt,
    });
  }

  if (updatedDay === date && task.updatedAt) {
    if (task.status === 'done') {
      lines.push({
        id: `${task.id}-done`,
        label: 'Done',
        title: task.title,
        at: task.updatedAt,
      });
    } else if (task.status === 'dropped') {
      lines.push({
        id: `${task.id}-dropped`,
        label: 'Dropped',
        title: task.title,
        at: task.updatedAt,
      });
    } else if (task.status === 'open' && createdDay !== date) {
      lines.push({
        id: `${task.id}-reopened`,
        label: 'Reopened',
        title: task.title,
        at: task.updatedAt,
      });
    }
  }

  return lines;
}

function collectTaskActivity(data: AppState, date: string): DayTaskActivity[] {
  const items: DayTaskActivity[] = [];

  data.topics.forEach((topic) => {
    topic.events.forEach((event) => {
      if (eventDay(event) !== date || !isTaskEvent(event)) return;
      items.push({
        id: event.id,
        label: taskLabel(event.kind),
        title: event.content.replace(/^(Done|Dropped|Reopened) · /, ''),
        at: event.createdAt || event.date,
        topicId: topic.id,
        topicTitle: topic.title,
      });
    });
  });

  data.tasks.forEach((task) => {
    if (task.topicId) return;
    items.push(...standaloneTaskLines(task, date));
  });

  return items.sort((a, b) => b.at.localeCompare(a.at));
}

/** Days that have a journal dump, topic writing, and/or task activity. Newest first. */
export function listJournalDays(data: AppState): JournalDaySummary[] {
  const dates = new Set<string>();

  Object.entries(data.journals).forEach(([date, journal]) => {
    if ((journal.dumps || []).some((dump) => !isEmptyDump(dump))) dates.add(date);
  });

  data.topics.forEach((topic) => {
    topic.events.forEach((event) => {
      if (isWritingEvent(event) || isTaskEvent(event)) dates.add(eventDay(event));
    });
  });

  data.tasks.forEach((task) => {
    if (task.topicId) return;
    dates.add(dayOf(task.createdAt));
    if (task.updatedAt) dates.add(dayOf(task.updatedAt));
  });

  return [...dates]
    .sort((a, b) => b.localeCompare(a))
    .map((date) => {
      const journal = data.journals[date] || emptyJournal();
      const dumps = (journal.dumps || []).filter((dump) => !isEmptyDump(dump));
      const topicActivityCount = data.topics.reduce(
        (count, topic) =>
          count + topic.events.filter((event) => eventDay(event) === date && isWritingEvent(event)).length,
        0,
      );
      const taskActivity = collectTaskActivity(data, date);
      return {
        date,
        dumpCount: dumps.length,
        topicLinkCount: journalTopicIds({ dumps }).length,
        topicActivityCount,
        taskActivityCount: taskActivity.length,
      };
    })
    .filter(
      (day) =>
        day.dumpCount > 0 || day.topicActivityCount > 0 || day.taskActivityCount > 0,
    );
}

export function getJournalDayDetail(data: AppState, date: string): JournalDayDetail {
  const journal = data.journals[date] || emptyJournal();
  const dumps = (journal.dumps || []).filter((dump) => !isEmptyDump(dump));
  const topicActivity: DayTopicActivity[] = [];

  data.topics.forEach((topic) => {
    topic.events.forEach((event) => {
      if (eventDay(event) === date && isWritingEvent(event)) {
        topicActivity.push({ topic, event });
      }
    });
  });

  topicActivity.sort((a, b) =>
    (b.event.createdAt || b.event.date).localeCompare(a.event.createdAt || a.event.date),
  );

  return {
    date,
    dumps: [...dumps].reverse(),
    linkedTopicIds: journalTopicIds({ dumps }),
    topicActivity,
    taskActivity: collectTaskActivity(data, date),
  };
}
