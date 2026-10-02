import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { ModalActions, ModalHeader, ModalPanel, ModalShell } from './ModalShell';
import { ghostBtnClass, inputClass, primaryBtnClass } from '../lib/ui';
import type { Thread } from '../types';

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
    <ModalShell onClose={onClose}>
      <ModalPanel
        as="form"
        onSubmit={(event) => {
          event.preventDefault();
          if (!title.trim()) return;
          onAdd(title.trim(), threadId || undefined);
          onClose();
        }}
      >
        <ModalHeader
          eyebrow="A small thing, taken off your mind"
          title="Add a task"
          onClose={onClose}
        />

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
          className={`mb-3 ${inputClass}`}
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
              className={`select-field mb-4 ${inputClass}`}
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

        <ModalActions>
          <button type="button" onClick={onClose} className={ghostBtnClass}>
            Cancel
          </button>
          <button type="submit" className={primaryBtnClass}>
            Add task <ArrowRight size={14} />
          </button>
        </ModalActions>
      </ModalPanel>
    </ModalShell>
  );
}
