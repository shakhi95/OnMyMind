import { useState } from 'react';
import { ArrowRight, Plus } from 'lucide-react';
import { ModalActions, ModalHeader, ModalPanel, ModalShell } from './ModalShell';
import { ago } from '../lib/dates';
import { ghostBtnClass, inputClass, primaryBtnClass } from '../lib/ui';
import type { Thread } from '../types';

/** Link a new or existing thread to this dump. */
export function DumpThreadBar({
  pastThreads,
  onCreateNew,
  onPickPast,
}: {
  pastThreads: Thread[];
  onCreateNew: (title: string) => void;
  onPickPast: (threadId: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 text-[11px] text-accent hover:text-ink"
      >
        <Plus size={14} /> Link a thread
      </button>

      {open && (
        <LinkThreadModal
          pastThreads={pastThreads}
          onClose={() => setOpen(false)}
          onCreateNew={(title) => {
            onCreateNew(title);
            setOpen(false);
          }}
          onPickPast={(threadId) => {
            onPickPast(threadId);
            setOpen(false);
          }}
        />
      )}
    </>
  );
}

function LinkThreadModal({
  pastThreads,
  onClose,
  onCreateNew,
  onPickPast,
}: {
  pastThreads: Thread[];
  onClose: () => void;
  onCreateNew: (title: string) => void;
  onPickPast: (threadId: string) => void;
}) {
  const [mode, setMode] = useState<'new' | 'past'>('new');
  const [title, setTitle] = useState('');
  const byStatus = (status: Thread['status']) => pastThreads.filter((thread) => thread.status === status);
  const groups = [
    ['Active', byStatus('active')],
    ['Later', byStatus('later')],
    ['Resolved', byStatus('resolved')],
    ['Dropped', byStatus('dropped')],
  ] as const;

  return (
    <ModalShell onClose={onClose}>
      <ModalPanel>
        <ModalHeader
          eyebrow="Optional — only if something stands out"
          title="Link a thread"
          onClose={onClose}
        />

        <div className="mb-5 flex gap-1 rounded-md border border-line bg-[#16171b] p-1">
          <button
            type="button"
            className={`flex-1 cursor-pointer rounded border-0 px-2 py-2 text-[11px] ${
              mode === 'new' ? 'bg-panel text-ink' : 'bg-transparent text-soft'
            }`}
            onClick={() => setMode('new')}
          >
            New thread
          </button>
          <button
            type="button"
            className={`flex-1 cursor-pointer rounded border-0 px-2 py-2 text-[11px] ${
              mode === 'past' ? 'bg-panel text-ink' : 'bg-transparent text-soft'
            }`}
            onClick={() => setMode('past')}
          >
            From past
          </button>
        </div>

        {mode === 'new' ? (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const next = title.trim();
              if (!next) return;
              onCreateNew(next);
            }}
          >
            <label htmlFor="dump-thread-title" className="mb-2 block text-[11px] text-muted">
              Give it a short title
            </label>
            <input
              id="dump-thread-title"
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
                Add thread <ArrowRight size={14} />
              </button>
            </ModalActions>
          </form>
        ) : (
          <div>
            <p className="mb-3 text-[11px] text-muted">Pick any thread — it becomes active on this dump.</p>
            <div className="mb-4 max-h-64 overflow-auto rounded-md border border-line bg-[#16171b] p-1">
              {pastThreads.length ? (
                groups.map(([label, list]) =>
                  list.length > 0 ? (
                    <div key={label}>
                      <div className="px-2 py-2 text-[10px] tracking-wide text-soft uppercase">{label}</div>
                      {list.map((thread) => (
                        <button
                          key={thread.id}
                          type="button"
                          onClick={() => onPickPast(thread.id)}
                          className="flex w-full cursor-pointer flex-col gap-0.5 rounded border-0 bg-transparent px-2 py-2 text-left hover:bg-panel"
                        >
                          <span className="text-[11px] text-ink">{thread.title}</span>
                          <span className="text-[10px] text-soft">
                            {thread.status} · last on your mind {ago(thread.updatedAt)}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : null,
                )
              ) : (
                <p className="px-2 py-3 text-[11px] text-soft">No past threads yet. Create a new one instead.</p>
              )}
            </div>
            <ModalActions>
              <button type="button" onClick={onClose} className={ghostBtnClass}>
                Cancel
              </button>
            </ModalActions>
          </div>
        )}
      </ModalPanel>
    </ModalShell>
  );
}
