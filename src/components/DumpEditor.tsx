import { ArrowRight, Trash2, X } from 'lucide-react';
import { DumpTopicBar } from './DumpTopicBar';
import { dateTimeText } from '../lib/dates';
import type { Dump, Topic } from '../types';
import { isEmptyDump } from '../types';

export function DumpEditor({
  dump,
  autoFocus,
  topics,
  linkableTopics,
  onChange,
  onBlurSave,
  onRemove,
  onCreateTopic,
  onLinkTopic,
  onUnlinkTopic,
  onOpenTopic,
}: {
  dump: Dump;
  autoFocus?: boolean;
  topics: Topic[];
  linkableTopics: Topic[];
  onChange: (content: string) => void;
  onBlurSave: () => void;
  onRemove: () => void;
  onCreateTopic: (title: string) => void;
  onLinkTopic: (topicId: string) => void;
  onUnlinkTopic: (topicId: string) => void;
  onOpenTopic: (id: string) => void;
}) {
  const linked = dump.topicIds
    .map((id) => topics.find((topic) => topic.id === id))
    .filter((topic): topic is Topic => Boolean(topic));
  const available = linkableTopics.filter((topic) => !dump.topicIds.includes(topic.id));
  const canDelete = !isEmptyDump(dump);

  return (
    <div className="border-t border-line">
      <div className="px-5 pt-4 pb-2 max-[620px]:px-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <time className="text-[10px] tracking-wide text-soft">{dateTimeText(dump.createdAt)}</time>
          {canDelete ? (
            <button
              type="button"
              onClick={onRemove}
              aria-label="Delete dump"
              className="cursor-pointer border-0 bg-transparent p-1 text-soft hover:text-[#c09281]"
            >
              <Trash2 size={14} />
            </button>
          ) : null}
        </div>
        <textarea
          autoFocus={autoFocus}
          className="min-h-[120px] w-full resize-y border-0 bg-transparent text-[15px] leading-[1.75] text-ink outline-none placeholder:text-soft"
          value={dump.content}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlurSave}
          placeholder="Dump whatever's here. No structure needed."
          aria-label={`Mind dump from ${dateTimeText(dump.createdAt)}`}
        />
      </div>

      <div className="mx-5 mb-4 max-[620px]:mx-4">
        {linked.length > 0 && (
          <div className="mb-2 rounded-lg border border-line bg-[#141518]">
            <div className="border-b border-line px-3 py-2 text-[10px] font-bold tracking-[1.5px] text-soft uppercase">
              Topics
            </div>
            <ul className="m-0 list-none p-0">
              {linked.map((topic) => (
                <li
                  key={topic.id}
                  className="flex items-center gap-2 border-t border-line px-3 py-2 first:border-t-0"
                >
                  <button
                    type="button"
                    onClick={() => onOpenTopic(topic.id)}
                    className="flex min-w-0 flex-1 cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 text-left text-[13px] font-medium text-ink hover:text-accent"
                  >
                    <span className="min-w-0 truncate">{topic.title}</span>
                    <ArrowRight size={13} className="shrink-0 text-accent" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Unlink ${topic.title}`}
                    onClick={() => onUnlinkTopic(topic.id)}
                    className="cursor-pointer border-0 bg-transparent p-1 text-soft hover:text-ink"
                  >
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <DumpTopicBar
          pastTopics={available}
          onCreateNew={onCreateTopic}
          onPickPast={onLinkTopic}
        />
      </div>
    </div>
  );
}
