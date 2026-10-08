import { ArrowLeft, ArrowRight, BookOpen, Feather } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';
import { KindChip, toneFromEventKind, toneFromTaskLabel } from '../components/KindChip';
import { PageHeader } from '../components/PageHeader';
import { dateTimeText, dayText } from '../lib/dates';
import { getJournalDayDetail, listJournalDays } from '../lib/journals';
import type { AppState } from '../types';

export function JournalsView({
  data,
  selectedDay,
  onOpenDay,
  onBackToList,
  onOpenTopic,
}: {
  data: AppState;
  selectedDay: string | null;
  onOpenDay: (day: string) => void;
  onBackToList: () => void;
  onOpenTopic: (id: string) => void;
}) {
  if (selectedDay) {
    return (
      <JournalDayView
        data={data}
        date={selectedDay}
        onBack={onBackToList}
        onOpenTopic={onOpenTopic}
      />
    );
  }

  const days = listJournalDays(data);

  return (
    <>
      <PageHeader
        eyebrow="Your days, kept"
        title="Journals"
        description="Open a day to see dumps, linked topics, writing, and tasks from then."
      />
      {!days.length ? (
        <EmptyState
          icon={<BookOpen />}
          title="No journals yet."
          text="When you dump something on Today, it will show up here by day."
        />
      ) : (
        <div className="grid gap-2">
          {days.map((day) => (
            <button
              key={day.date}
              type="button"
              onClick={() => onOpenDay(day.date)}
              className="flex w-full cursor-pointer items-center gap-3 rounded-[9px] border border-line bg-surface px-4 py-3.5 text-left hover:border-edge"
            >
              <span className="grid h-[30px] w-[30px] place-items-center rounded-[9px] bg-panel text-accent">
                <BookOpen size={16} />
              </span>
              <span className="min-w-0 flex-1">
                <strong className="block text-sm font-semibold text-ink">
                  {dayText(day.date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </strong>
                <small className="mt-1 block text-[11px] text-soft">
                  {day.dumpCount} {day.dumpCount === 1 ? 'dump' : 'dumps'}
                  {day.topicLinkCount
                    ? ` · ${day.topicLinkCount} linked ${day.topicLinkCount === 1 ? 'topic' : 'topics'}`
                    : ''}
                  {day.topicActivityCount
                    ? ` · ${day.topicActivityCount} topic ${day.topicActivityCount === 1 ? 'note' : 'notes'}`
                    : ''}
                  {day.taskActivityCount
                    ? ` · ${day.taskActivityCount} task ${day.taskActivityCount === 1 ? 'update' : 'updates'}`
                    : ''}
                </small>
              </span>
              <ArrowRight size={16} className="text-soft" />
            </button>
          ))}
        </div>
      )}
    </>
  );
}

function JournalDayView({
  data,
  date,
  onBack,
  onOpenTopic,
}: {
  data: AppState;
  date: string;
  onBack: () => void;
  onOpenTopic: (id: string) => void;
}) {
  const detail = getJournalDayDetail(data, date);
  const hasDumps = detail.dumps.length > 0;
  const hasActivity = detail.topicActivity.length > 0;
  const hasTasks = detail.taskActivity.length > 0;
  const topicById = new Map(data.topics.map((topic) => [topic.id, topic]));

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="mb-6 flex cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 text-[11px] text-soft hover:text-ink"
      >
        <ArrowLeft size={14} /> All journals
      </button>

      <div className="mb-2 text-[10px] font-bold tracking-[1.5px] text-accent uppercase">A day on your mind</div>
      <h1 className="m-0 font-display text-[clamp(1.75rem,4vw,2.25rem)] font-medium tracking-[-1px] text-ink">
        {dayText(date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
      </h1>
      <p className="mt-2 mb-8 text-[13px] text-muted">Everything you put down this day.</p>

      <section className="mb-8">
        <div className="mb-3 flex items-center gap-2 text-[10px] font-bold tracking-[1.5px] text-soft uppercase">
          <Feather size={13} /> Dumps & topics
        </div>
        {!hasDumps ? (
          <p className="rounded-[10px] border border-line bg-surface px-4 py-3 text-xs text-soft">
            No dumps this day. Topic writing below may still have happened.
          </p>
        ) : (
          <div className="grid gap-3">
            {detail.dumps.map((dump) => {
              const linked = dump.topicIds
                .map((id) => topicById.get(id))
                .filter((topic): topic is NonNullable<typeof topic> => Boolean(topic));
              return (
                <article key={dump.id} className="rounded-[10px] border border-line bg-surface px-4 py-4">
                  <time className="text-[10px] tracking-wide text-soft">{dateTimeText(dump.createdAt)}</time>
                  {dump.content.trim() ? (
                    <p className="mt-2 mb-0 whitespace-pre-wrap text-[13px] leading-relaxed text-ink">{dump.content}</p>
                  ) : null}
                  {linked.length > 0 && (
                    <ol className="mt-3 list-none border-t border-line pt-2">
                      {linked.map((topic, index) => (
                        <li key={topic.id} className="flex items-center gap-2 py-1.5 text-[13px] text-ink">
                          <span className="w-5 shrink-0 font-display text-[11px] text-soft">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <span className="min-w-0 flex-1 font-medium">{topic.title || 'Untitled'}</span>
                          <button
                            type="button"
                            onClick={() => onOpenTopic(topic.id)}
                            className="inline-flex shrink-0 cursor-pointer items-center gap-0.5 border-0 bg-transparent p-0 text-[10px] text-accent hover:text-ink"
                          >
                            Open <ArrowRight size={12} />
                          </button>
                        </li>
                      ))}
                    </ol>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="mb-8">
        <div className="mb-3 text-[10px] font-bold tracking-[1.5px] text-soft uppercase">
          On topics that day
        </div>
        {!hasActivity ? (
          <p className="rounded-[10px] border border-line bg-surface px-4 py-3 text-xs text-soft">
            No topic writing this day.
          </p>
        ) : (
          <div className="grid gap-2">
            {detail.topicActivity.map(({ topic, event }) => (
              <article
                key={event.id}
                className="rounded-lg border border-line bg-surface px-4 py-3.5"
              >
                <small className="flex flex-wrap items-center gap-2 text-[10px] tracking-[0.8px] text-soft uppercase">
                  <time>{dateTimeText(event.createdAt || `${event.date}T12:00:00`)}</time>
                  <KindChip tone={toneFromEventKind(event.kind)} />
                  <span>{topic.title}</span>
                </small>
                <p className="mt-2 mb-2 whitespace-pre-wrap text-[13px] leading-relaxed text-ink">{event.content}</p>
                <button
                  type="button"
                  onClick={() => onOpenTopic(topic.id)}
                  className="inline-flex cursor-pointer items-center gap-1 border-0 bg-transparent p-0 text-[11px] text-accent hover:text-ink"
                >
                  Open topic <ArrowRight size={12} />
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 text-[10px] font-bold tracking-[1.5px] text-soft uppercase">Tasks that day</div>
        {!hasTasks ? (
          <p className="rounded-[10px] border border-line bg-surface px-4 py-3 text-xs text-soft">
            No task updates this day.
          </p>
        ) : (
          <ul className="m-0 list-none rounded-[10px] border border-line bg-surface p-0">
            {detail.taskActivity.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-2 border-t border-line px-4 py-2.5 first:border-t-0"
              >
                <KindChip tone={toneFromTaskLabel(item.label)}>{item.label}</KindChip>
                <span className="min-w-0 flex-1 text-[13px] text-ink">{item.title}</span>
                {item.topicId ? (
                  <button
                    type="button"
                    onClick={() => onOpenTopic(item.topicId!)}
                    className="inline-flex shrink-0 cursor-pointer items-center gap-0.5 border-0 bg-transparent p-0 text-[10px] text-accent hover:text-ink"
                  >
                    {item.topicTitle || 'Topic'} <ArrowRight size={12} />
                  </button>
                ) : (
                  <span className="shrink-0 text-[10px] text-soft">Standalone</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
