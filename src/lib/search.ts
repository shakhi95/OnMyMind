import type { AppState, SearchResult } from '../types';

export function getSearchResults(data: AppState, query: string): SearchResult[] {
  const term = query.trim().toLowerCase();
  if (!term) return [];

  const results: SearchResult[] = [];

  data.topics.forEach((topic) => {
    if (topic.title.toLowerCase().includes(term)) {
      results.push({
        kind: 'topic',
        title: topic.title,
        excerpt: `${topic.status} topic`,
        date: topic.updatedAt,
        topicId: topic.id,
        targetId: topic.id,
      });
    }
    topic.events.forEach((event) => {
      if (event.content.toLowerCase().includes(term)) {
        results.push({
          kind: event.kind === 'decision' ? 'decision' : event.kind === 'thinking' ? 'note' : 'topic',
          title: topic.title,
          excerpt: event.content,
          date: event.createdAt || event.date,
          topicId: topic.id,
          targetId: event.id,
        });
      }
    });
  });

  data.tasks.forEach((task) => {
    if (task.title.toLowerCase().includes(term)) {
      const parent = data.topics.find((topic) => topic.id === task.topicId);
      results.push({
        kind: 'task',
        title: task.title,
        excerpt: parent ? `Task · ${parent.title}` : `Standalone task · ${task.status}`,
        date: task.createdAt,
        topicId: task.topicId,
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
