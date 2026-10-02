import { ArrowRight, Circle } from 'lucide-react';
import { ago } from '../lib/dates';
import { THREAD_STATUS_CHIP } from '../lib/ui';
import type { Task, Thread } from '../types';

export function ThreadCard({
  thread,
  tasks,
  onClick,
}: {
  thread: Thread;
  tasks: Task[];
  onClick: () => void;
}) {
  const open = tasks.filter((task) => task.status === 'open').length;
  const writingCount = thread.events.filter(
    (event) => event.kind === 'thinking' || event.kind === 'decision',
  ).length;

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full cursor-pointer items-center gap-3 rounded-[9px] border border-line bg-surface px-4 py-3.5 text-left hover:border-edge"
    >
      <span className="grid h-[30px] w-[30px] place-items-center rounded-[9px] bg-panel text-accent">
        <Circle size={17} />
      </span>
      <span className="min-w-0 flex-1">
        <strong className="block text-sm font-semibold text-ink">{thread.title}</strong>
        <small className="mt-1.5 block text-[11px] text-soft">
          {writingCount} {writingCount === 1 ? 'note' : 'notes'} · {thread.events.length} updates · last
          on your mind {ago(thread.updatedAt)}
          {open ? ` · ${open} open ${open === 1 ? 'task' : 'tasks'}` : ''}
        </small>
      </span>
      <span
        className={`rounded-full px-2 py-1 text-[9px] tracking-[0.8px] uppercase ${THREAD_STATUS_CHIP[thread.status]}`}
      >
        {thread.status}
      </span>
      <ArrowRight size={16} className="text-soft" />
    </button>
  );
}
