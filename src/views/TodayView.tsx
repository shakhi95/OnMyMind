import { useEffect, useRef } from 'react';
import { Feather, Plus, Sparkles } from 'lucide-react';
import { DumpEditor } from '../components/DumpEditor';
import type { Journal, Topic } from '../types';
import { isEmptyDump } from '../types';

export function TodayView({
  journal,
  topics,
  onAddDump,
  onUpdateDump,
  onFlushSave,
  onRemoveDump,
  onCreateTopic,
  onLinkTopic,
  onUnlinkTopic,
  onOpenTopic,
}: {
  journal: Journal;
  topics: Topic[];
  onAddDump: () => void;
  onUpdateDump: (id: string, content: string) => void;
  onFlushSave: () => void;
  onRemoveDump: (id: string) => void;
  onCreateTopic: (dumpId: string, title: string) => void;
  onLinkTopic: (dumpId: string, topicId: string) => void;
  onUnlinkTopic: (dumpId: string, topicId: string) => void;
  onOpenTopic: (id: string) => void;
}) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  const ensured = useRef(false);
  const dumps = journal.dumps;
  const linkableTopics = [...topics].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
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
          Dump your mind. Link a topic only if something stands out.
        </p>
      </div>

      <section className="overflow-visible rounded-xl border border-line bg-gradient-to-br from-[#191a20] to-surface pb-4 shadow-[0_14px_44px_#0002]">
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
            topics={topics}
            linkableTopics={linkableTopics}
            onChange={(content) => onUpdateDump(dump.id, content)}
            onBlurSave={onFlushSave}
            onRemove={() => onRemoveDump(dump.id)}
            onCreateTopic={(title) => onCreateTopic(dump.id, title)}
            onLinkTopic={(topicId) => onLinkTopic(dump.id, topicId)}
            onUnlinkTopic={(topicId) => onUnlinkTopic(dump.id, topicId)}
            onOpenTopic={onOpenTopic}
          />
        ))}
      </section>
    </>
  );
}
