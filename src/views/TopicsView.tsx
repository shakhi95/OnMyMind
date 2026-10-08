import { Circle, Plus } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import { TopicCard } from '../components/TopicCard';
import { useSessionTab } from '../hooks/useSessionTab';
import { TOPICS_TAB_KEY, primaryBtnClass } from '../lib/ui';
import type { Task, Topic, TopicStatus } from '../types';

const TABS: { id: TopicStatus; label: string; emptyTitle: string; emptyText: string }[] = [
  {
    id: 'active',
    label: 'Active',
    emptyTitle: 'Your mind is quiet here.',
    emptyText: 'When something from a dump feels worth returning to, give it a topic.',
  },
  {
    id: 'later',
    label: 'Later',
    emptyTitle: 'Nothing waiting here.',
    emptyText: 'Move a topic here whenever the timing doesn’t feel right.',
  },
  {
    id: 'resolved',
    label: 'Resolved',
    emptyTitle: 'Nothing resolved yet.',
    emptyText: 'When a topic feels finished, mark it resolved — it’ll live here.',
  },
  {
    id: 'dropped',
    label: 'Dropped',
    emptyTitle: 'Nothing let go yet.',
    emptyText: 'Topics you release will land here if you ever want them back.',
  },
];

const TAB_IDS = TABS.map((tab) => tab.id);

export function TopicsView({
  topics,
  tasks,
  onOpen,
  onAdd,
}: {
  topics: Topic[];
  tasks: Task[];
  onOpen: (id: string) => void;
  onAdd: () => void;
}) {
  const [tab, setTab] = useSessionTab(TOPICS_TAB_KEY, TAB_IDS, 'active');
  const current = TABS.find((item) => item.id === tab) || TABS[0];
  const filtered = topics
    .filter((topic) => topic.status === tab)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  const counts = Object.fromEntries(
    TABS.map((item) => [item.id, topics.filter((topic) => topic.status === item.id).length]),
  ) as Record<TopicStatus, number>;

  return (
    <>
      <PageHeader
        eyebrow="The things that stay with you"
        title="Your topics"
        description="Active topics, things set aside, and what’s resolved or let go."
      >
        <button type="button" onClick={onAdd} className={primaryBtnClass}>
          <Plus size={15} /> Add a topic
        </button>
      </PageHeader>

      <div className="mb-5 flex gap-1 rounded-md border border-line bg-[#16171b] p-1">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`flex-1 cursor-pointer rounded border-0 px-2 py-2 text-[11px] ${
              tab === item.id ? 'bg-panel text-ink' : 'bg-transparent text-soft'
            }`}
          >
            {item.label}
            {counts[item.id] > 0 ? ` · ${counts[item.id]}` : ''}
          </button>
        ))}
      </div>

      <div className="grid gap-2">
        {filtered.length ? (
          filtered.map((topic) => (
            <TopicCard
              key={topic.id}
              topic={topic}
              tasks={tasks.filter((task) => task.topicId === topic.id)}
              onClick={() => onOpen(topic.id)}
            />
          ))
        ) : (
          <EmptyState icon={<Circle />} title={current.emptyTitle} text={current.emptyText} />
        )}
      </div>
    </>
  );
}
