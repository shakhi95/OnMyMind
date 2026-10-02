import { useState } from 'react';
import { ArrowRight, X } from 'lucide-react';
import type { Thread } from '../types';

/** Simple add-task modal — no mode tabs. */
export function AddTaskDialog({
  onClose,
  onAdd,
  threads = [],
}: {
  onClose: () => void;
  onAdd: (title: string, threadId?: string) => void;
  threads?: Thread[];
}) {
  const [title, setTitle] = useState('');
  const [threadId, setThreadId] = useState('');

  return (
    <div
      className="fixed inset-0 z-20 grid place-items-center bg-black/55 backdrop-blur-[4px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <form
        className="w-[min(430px,calc(100vw-32px))] rounded-xl border border-edge bg-[#191a20] p-6 shadow-[0_26px_90px_#000b]"
        onSubmit={(event) => {
          event.preventDefault();
          if (!title.trim()) return;
          onAdd(title.trim(), threadId || undefined);
          onClose();
        }}
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <div className="mb-2 text-[8px] font-bold tracking-[1.5px] text-accent uppercase">
              A small thing, taken off your mind
            </div>
            <h2 className="m-0 font-display text-2xl font-medium tracking-tight text-ink">Add a task</h2>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="grid h-7 w-7 cursor-pointer place-items-center rounded-full border border-line bg-panel text-soft"
          >
            <X size={17} />
          </button>
        </div>

        <label htmlFor="add-task-title" className="mb-2 block text-[11px] text-muted">
          Already know what needs to happen?
        </label>
        <input
          id="add-task-title"
          autoFocus
          autoComplete="off"
          maxLength={180}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="e.g. Pick up a few things from the shop"
          className="mb-3 block w-full rounded-md border border-line bg-surface px-3 py-2.5 text-xs text-ink outline-none focus:border-edge focus:shadow-[0_0_0_2px_#36402e]"
        />

        {threads.length > 0 && (
          <>
            <label htmlFor="add-task-thread" className="mb-2 block text-[11px] text-muted">
              Link to a thread (optional)
            </label>
            <select
              id="add-task-thread"
              value={threadId}
              onChange={(event) => setThreadId(event.target.value)}
              className="select-field mb-4 block w-full rounded-md border border-line bg-surface py-2.5 pl-3 text-xs text-ink outline-none focus:border-edge"
            >
              <option value="">No thread</option>
              {threads.map((thread) => (
                <option key={thread.id} value={thread.id}>
                  {thread.title}
                </option>
              ))}
            </select>
          </>
        )}
        {threads.length === 0 && <div className="mb-4" />}

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer border-0 bg-transparent px-2 py-2 text-[11px] text-soft hover:text-ink"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-accent bg-accent px-3 py-2 text-[11px] font-semibold text-[#222329] hover:bg-[#d0d1e0]"
          >
            Add task <ArrowRight size={14} />
          </button>
        </div>
      </form>
    </div>
  );
}
