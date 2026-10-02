import { Circle, Plus } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import { ThreadCard } from '../components/ThreadCard';
import { useSessionTab } from '../hooks/useSessionTab';
import { THREADS_TAB_KEY, primaryBtnClass } from '../lib/ui';
import type { Task, Thread, ThreadStatus } from '../types';

const TABS: { id: ThreadStatus; label: string; emptyTitle: string; emptyText: string }[] = [
  {
    id: 'active',
    label: 'Active',
    emptyTitle: 'Your mind is quiet here.',
    emptyText: 'When something from a dump feels worth returning to, give it a thread.',
  },
  {
    id: 'later',
    label: 'Later',
    emptyTitle: 'Nothing waiting here.',
    emptyText: 'Move a thread here whenever the timing doesn’t feel right.',
  },
  {
    id: 'resolved',
    label: 'Resolved',
    emptyTitle: 'Nothing resolved yet.',
    emptyText: 'When a thread feels finished, mark it resolved — it’ll live here.',
  },
  {
    id: 'dropped',
    label: 'Dropped',
    emptyTitle: 'Nothing let go yet.',
    emptyText: 'Threads you release will land here if you ever want them back.',
  },
];

const TAB_IDS = TABS.map((tab) => tab.id);

export function ThreadsView({
  threads,
  tasks,
  onOpen,
  onAdd,
}: {
  threads: Thread[];
  tasks: Task[];
  onOpen: (id: string) => void;
  onAdd: () => void;
}) {
  const [tab, setTab] = useSessionTab(THREADS_TAB_KEY, TAB_IDS, 'active');
  const current = TABS.find((item) => item.id === tab) || TABS[0];
  const filtered = threads
    .filter((thread) => thread.status === tab)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  const counts = Object.fromEntries(
    TABS.map((item) => [item.id, threads.filter((thread) => thread.status === item.id).length]),
  ) as Record<ThreadStatus, number>;

  return (
    <>
      <PageHeader
        eyebrow="The things that stay with you"
        title="Your threads"
        description="Active topics, things set aside, and what’s resolved or let go."
      >
        <button type="button" onClick={onAdd} className={primaryBtnClass}>
          <Plus size={15} /> Add a thread
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
          filtered.map((thread) => (
            <ThreadCard
              key={thread.id}
              thread={thread}
              tasks={tasks.filter((task) => task.threadId === thread.id)}
              onClick={() => onOpen(thread.id)}
            />
          ))
        ) : (
          <EmptyState icon={<Circle />} title={current.emptyTitle} text={current.emptyText} />
        )}
      </div>
    </>
  );
}
