import { Check } from 'lucide-react';
import { ago } from '../lib/dates';
import type { Task, TaskStatus, Thread } from '../types';

export function TaskRow({
  task,
  thread,
  onChange,
  onOpenThread,
}: {
  task: Task;
  thread?: Thread;
  onChange: (status: TaskStatus) => void;
  onOpenThread?: (id: string) => void;
}) {
  const statusLabel =
    task.status === 'done' ? 'Done' : task.status === 'dropped' ? 'Dropped' : null;

  return (
    <article id={`task-${task.id}`} className="flex items-center gap-3 rounded-lg border border-line bg-surface px-4 py-3.5">
      <button
        type="button"
        className={[
          'grid h-[17px] w-[17px] shrink-0 place-items-center rounded-full border p-0',
          task.status === 'done' ? 'border-accent bg-accent text-[#222329]' : 'border-soft bg-transparent',
        ].join(' ')}
        aria-label={task.status === 'open' ? 'Mark task done' : 'Reopen task'}
        onClick={() => onChange(task.status === 'open' ? 'done' : 'open')}
      >
        {task.status === 'done' && <Check size={13} />}
      </button>
      <span className="min-w-0 flex-1">
        <span className={`block text-[13px] ${task.status === 'done' ? 'text-soft line-through' : 'text-ink'}`}>
          {task.title}
        </span>
        <small className="mt-1 block text-[11px] text-soft">
          Added {ago(task.createdAt)}
          {statusLabel && task.updatedAt ? ` · ${statusLabel} ${ago(task.updatedAt)}` : ''}
          {thread && (
            <>
              {' · '}
              {onOpenThread ? (
                <button
                  type="button"
                  onClick={() => onOpenThread(thread.id)}
                  className="cursor-pointer border-0 bg-transparent p-0 text-[11px] text-accent hover:text-ink"
                >
                  Thread: {thread.title}
                </button>
              ) : (
                <>Thread: {thread.title}</>
              )}
            </>
          )}
        </small>
      </span>
      <select
        aria-label="Task status"
        value={task.status}
        onChange={(event) => onChange(event.target.value as TaskStatus)}
        className="select-field rounded border border-line bg-hover py-1.5 pl-2.5 text-[10px] text-soft"
      >
        <option value="open">Open</option>
        <option value="done">Done</option>
        <option value="dropped">Dropped</option>
      </select>
    </article>
  );
}
