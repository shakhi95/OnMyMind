import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { ModalActions, ModalHeader, ModalPanel, ModalShell } from './ModalShell';
import { ghostBtnClass, inputClass, primaryBtnClass } from '../lib/ui';
import type { Topic } from '../types';

export function AddTaskDialog({
  onClose,
  onAdd,
  topics = [],
}: {
  onClose: () => void;
  onAdd: (title: string, topicId?: string) => void;
  topics?: Topic[];
}) {
  const [title, setTitle] = useState('');
  const [topicId, setTopicId] = useState('');

  return (
    <ModalShell onClose={onClose}>
      <ModalPanel
        as="form"
        onSubmit={(event) => {
          event.preventDefault();
          if (!title.trim()) return;
          onAdd(title.trim(), topicId || undefined);
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
          autoComplete="off"
          maxLength={180}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="e.g. Pick up a few things from the shop"
          className={`mb-3 ${inputClass}`}
        />

        {topics.length > 0 && (
          <>
            <label htmlFor="add-task-topic" className="mb-2 block text-[11px] text-muted">
              Link to a topic (optional)
            </label>
            <select
              id="add-task-topic"
              value={topicId}
              onChange={(event) => setTopicId(event.target.value)}
              className={`select-field mb-4 ${inputClass}`}
            >
              <option value="">No topic</option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.title}
                </option>
              ))}
            </select>
          </>
        )}
        {topics.length === 0 && <div className="mb-4" />}

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
