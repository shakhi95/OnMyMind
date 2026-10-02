import type { AppState, SearchResult } from '../types';

export function getSearchResults(data: AppState, query: string): SearchResult[] {
  const term = query.trim().toLowerCase();
  if (!term) return [];

  const results: SearchResult[] = [];

  data.threads.forEach((thread) => {
    if (thread.title.toLowerCase().includes(term)) {
      results.push({
        kind: 'thread',
        title: thread.title,
        excerpt: `${thread.status} thread`,
        date: thread.updatedAt,
        threadId: thread.id,
        targetId: thread.id,
      });
    }
    thread.events.forEach((event) => {
      if (event.content.toLowerCase().includes(term)) {
        results.push({
          kind: event.kind === 'decision' ? 'decision' : event.kind === 'thinking' ? 'note' : 'thread',
          title: thread.title,
          excerpt: event.content,
          date: event.createdAt || event.date,
          threadId: thread.id,
          targetId: event.id,
        });
      }
    });
  });

  data.tasks.forEach((task) => {
    if (task.title.toLowerCase().includes(term)) {
      const parent = data.threads.find((thread) => thread.id === task.threadId);
      results.push({
        kind: 'task',
        title: task.title,
        excerpt: parent ? `Task · ${parent.title}` : `Standalone task · ${task.status}`,
        date: task.createdAt,
        threadId: task.threadId,
        targetId: task.id,
      });
    }
  });

  Object.entries(data.journals).forEach(([date, journal]) => {
    (journal.dumps || []).forEach((dump) => {
      if (dump.content.toLowerCase().includes(term)) {
        results.push({
          kind: 'dump',
          title: 'Mind dump',
          excerpt: dump.content,
          date: dump.createdAt || date,
          targetId: dump.id,
        });
      }
    });
  });

  return results.sort((a, b) => b.date.localeCompare(a.date));
}
