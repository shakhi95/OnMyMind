import { useEffect, useRef } from 'react';
import { Feather, Plus, Sparkles } from 'lucide-react';
import { DumpEditor } from '../components/DumpEditor';
import type { Journal, Thread } from '../types';
import { isEmptyDump } from '../types';

export function TodayView({
  journal,
  threads,
  saved,
  saveError,
  onAddDump,
  onUpdateDump,
  onRemoveDump,
  onCreateThread,
  onLinkThread,
  onUnlinkThread,
  onOpenThread,
}: {
  journal: Journal;
  threads: Thread[];
  saved: boolean;
  saveError: boolean;
  onAddDump: () => void;
  onUpdateDump: (id: string, content: string) => void;
  onRemoveDump: (id: string) => void;
  onCreateThread: (dumpId: string, title: string) => void;
  onLinkThread: (dumpId: string, threadId: string) => void;
  onUnlinkThread: (dumpId: string, threadId: string) => void;
  onOpenThread: (id: string) => void;
}) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  const ensured = useRef(false);
  const dumps = journal.dumps;
  const linkableThreads = [...threads].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const latestDumpId = dumps[dumps.length - 1]?.id;
  const hasEmptyDump = dumps.some(isEmptyDump);
  const canWriteAgain = dumps.length > 0 && !hasEmptyDump;

  useEffect(() => {
    if (ensured.current || dumps.length > 0) return;
    ensured.current = true;
    onAddDump();
  }, [dumps.length, onAddDump]);

  return (
    <>
      <div className="mb-8">
        <div className="mb-2.5 flex items-center gap-1.5 text-[10px] font-bold tracking-[1.5px] text-accent uppercase">
          <Sparkles size={13} /> A moment for yourself
        </div>
        <h1 className="m-0 font-display text-[clamp(1.875rem,4vw,2.375rem)] font-medium tracking-[-1.5px] text-ink">
          Good {greeting}.
        </h1>
        <p className="mt-2 mb-0 text-[13px] text-muted">
          Dump your mind. Link a thread only if something stands out.
        </p>
      </div>

      <section className="overflow-visible rounded-xl border border-line bg-gradient-to-br from-[#191a20] to-surface shadow-[0_14px_44px_#0002]">
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="grid place-items-center text-accent">
              <Feather size={15} />
            </span>
            <h2 className="m-0 text-sm font-semibold text-ink">Dump what's on your mind</h2>
          </div>
          {canWriteAgain ? (
            <button
              type="button"
              onClick={onAddDump}
              className="inline-flex cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 text-[11px] text-accent hover:text-ink"
            >
              <Plus size={15} /> Write again
            </button>
          ) : null}
        </div>

        {[...dumps].reverse().map((dump) => (
          <DumpEditor
            key={dump.id}
            dump={dump}
            autoFocus={dump.id === latestDumpId && !dump.content}
            threads={threads}
            linkableThreads={linkableThreads}
            onChange={(content) => onUpdateDump(dump.id, content)}
            onRemove={() => onRemoveDump(dump.id)}
            onCreateThread={(title) => onCreateThread(dump.id, title)}
            onLinkThread={(threadId) => onLinkThread(dump.id, threadId)}
            onUnlinkThread={(threadId) => onUnlinkThread(dump.id, threadId)}
            onOpenThread={onOpenThread}
          />
        ))}

        <p
          className={`px-5 pb-5 text-[10px] max-[620px]:px-4 ${
            saveError ? 'text-[#d4a18e]' : 'text-soft'
          }`}
        >
          {saveError
            ? 'Could not save right now — your writing is still here in this window.'
            : saved
              ? 'Saved on this device as you write.'
              : 'Saving…'}
        </p>
      </section>
    </>
  );
}
