import { ListChecks, Plus } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import { TaskRow } from '../components/TaskRow';
import { useSessionTab } from '../hooks/useSessionTab';
import { TASKS_TAB_KEY, primaryBtnClass } from '../lib/ui';
import type { Task, TaskStatus, Topic } from '../types';

const TABS: { id: TaskStatus; label: string; emptyTitle: string; emptyText: string }[] = [
  {
    id: 'open',
    label: 'Open',
    emptyTitle: 'Nothing you need to do right now.',
    emptyText: 'You can let this be a quiet moment. Add an action whenever one becomes clear.',
  },
  {
    id: 'done',
    label: 'Done',
    emptyTitle: 'Nothing completed yet.',
    emptyText: 'Finished tasks will stay here so you can look back.',
  },
  {
    id: 'dropped',
    label: 'Dropped',
    emptyTitle: 'Nothing dropped yet.',
    emptyText: 'Tasks you let go of will land here.',
  },
];

const TAB_IDS = TABS.map((tab) => tab.id);

export function TasksView({
  tasks,
  topics,
  onChange,
  onAdd,
  onOpenTopic,
}: {
  tasks: Task[];
  topics: Topic[];
  onChange: (id: string, status: TaskStatus) => void;
  onAdd: () => void;
  onOpenTopic: (id: string) => void;
}) {
  const [tab, setTab] = useSessionTab(TASKS_TAB_KEY, TAB_IDS, 'open');
  const current = TABS.find((item) => item.id === tab) || TABS[0];
  const filtered = tasks
    .filter((task) => task.status === tab)
    .sort((a, b) => {
      if (tab === 'open') return b.createdAt.localeCompare(a.createdAt);
      return (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt);
    });

  const counts = Object.fromEntries(
    TABS.map((item) => [item.id, tasks.filter((task) => task.status === item.id).length]),
  ) as Record<TaskStatus, number>;

  return (
    <>
      <PageHeader
        eyebrow="Small steps, when you're ready"
        title="Your tasks"
        description="Things you chose to do. Nothing more complicated than that."
      >
        <button type="button" onClick={onAdd} className={primaryBtnClass}>
          <Plus size={15} /> Add a task
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

      {filtered.length ? (
        <div className="grid gap-2">
          {filtered.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              topic={topics.find((topic) => topic.id === task.topicId)}
              onChange={(status) => onChange(task.id, status)}
              onOpenTopic={onOpenTopic}
            />
          ))}
        </div>
      ) : (
        <EmptyState icon={<ListChecks />} title={current.emptyTitle} text={current.emptyText} />
      )}
    </>
  );
}
