import { useState } from 'react';
import { ArrowRight, Plus, X } from 'lucide-react';
import { ago } from '../lib/dates';
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
  const active = byStatus('active');
  const later = byStatus('later');
  const resolved = byStatus('resolved');
  const dropped = byStatus('dropped');

  return (
    <div
      className="fixed inset-0 z-20 grid place-items-center bg-black/55 backdrop-blur-[4px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-[min(430px,calc(100vw-32px))] rounded-xl border border-edge bg-[#191a20] p-6 shadow-[0_26px_90px_#000b]">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <div className="mb-2 text-[8px] font-bold tracking-[1.5px] text-accent uppercase">
              Optional — only if something stands out
            </div>
            <h2 className="m-0 font-display text-2xl font-medium tracking-tight text-ink">Link a thread</h2>
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
              className="mb-4 block w-full rounded-md border border-line bg-surface px-3 py-2.5 text-xs text-ink outline-none focus:border-edge focus:shadow-[0_0_0_2px_#36402e]"
            />
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
                Add thread <ArrowRight size={14} />
              </button>
            </div>
          </form>
        ) : (
          <div>
            <p className="mb-3 text-[11px] text-muted">Pick any thread — it becomes active on this dump.</p>
            <div className="mb-4 max-h-64 overflow-auto rounded-md border border-line bg-[#16171b] p-1">
              {pastThreads.length ? (
                <>
                  {(
                    [
                      ['Active', active],
                      ['Later', later],
                      ['Resolved', resolved],
                      ['Dropped', dropped],
                    ] as const
                  ).map(([label, list]) =>
                    list.length > 0 ? (
                      <div key={label}>
                        <div className="px-2 py-2 text-[10px] tracking-wide text-soft uppercase">{label}</div>
                        {list.map((thread) => (
                          <PastItem
                            key={thread.id}
                            title={thread.title}
                            meta={`${thread.status} · last on your mind ${ago(thread.updatedAt)}`}
                            onClick={() => onPickPast(thread.id)}
                          />
                        ))}
                      </div>
                    ) : null,
                  )}
                </>
              ) : (
                <p className="px-2 py-3 text-[11px] text-soft">No past threads yet. Create a new one instead.</p>
              )}
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer border-0 bg-transparent px-2 py-2 text-[11px] text-soft hover:text-ink"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PastItem({
  title,
  meta,
  onClick,
}: {
  title: string;
  meta: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full cursor-pointer flex-col gap-0.5 rounded border-0 bg-transparent px-2 py-2 text-left hover:bg-panel"
    >
      <span className="text-[11px] text-ink">{title}</span>
      <span className="text-[10px] text-soft">{meta}</span>
    </button>
  );
}
