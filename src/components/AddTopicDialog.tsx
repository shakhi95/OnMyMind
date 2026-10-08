import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { ModalActions, ModalHeader, ModalPanel, ModalShell } from './ModalShell';
import { ghostBtnClass, inputClass, primaryBtnClass } from '../lib/ui';

export function AddTopicDialog({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (title: string) => void;
}) {
  const [title, setTitle] = useState('');

  return (
    <ModalShell onClose={onClose}>
      <ModalPanel
        as="form"
        onSubmit={(event) => {
          event.preventDefault();
          if (!title.trim()) return;
          onAdd(title.trim());
          onClose();
        }}
      >
        <ModalHeader eyebrow="Something to return to" title="Add a topic" onClose={onClose} />

        <label htmlFor="add-topic-title" className="mb-2 block text-[11px] text-muted">
          Give it a short title
        </label>
        <input
          id="add-topic-title"
          autoFocus
          autoComplete="off"
          maxLength={180}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="e.g. That conversation keeps looping"
          className={`mb-4 ${inputClass}`}
        />

        <ModalActions>
          <button type="button" onClick={onClose} className={ghostBtnClass}>
            Cancel
          </button>
          <button type="submit" className={primaryBtnClass}>
            Add topic <ArrowRight size={14} />
          </button>
        </ModalActions>
      </ModalPanel>
    </ModalShell>
  );
}
