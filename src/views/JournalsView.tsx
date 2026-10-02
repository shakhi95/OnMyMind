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
  onOpenThread,
}: {
  data: AppState;
  selectedDay: string | null;
  onOpenDay: (day: string) => void;
  onBackToList: () => void;
  onOpenThread: (id: string) => void;
}) {
  if (selectedDay) {
    return (
      <JournalDayView
        data={data}
        date={selectedDay}
        onBack={onBackToList}
        onOpenThread={onOpenThread}
      />
    );
  }

  const days = listJournalDays(data);

  return (
    <>
      <PageHeader
        eyebrow="Your days, kept"
        title="Journals"
        description="Open a day to see dumps, linked threads, writing, and tasks from then."
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
                  {day.threadLinkCount
                    ? ` · ${day.threadLinkCount} linked ${day.threadLinkCount === 1 ? 'thread' : 'threads'}`
                    : ''}
                  {day.threadActivityCount
                    ? ` · ${day.threadActivityCount} thread ${day.threadActivityCount === 1 ? 'note' : 'notes'}`
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
  onOpenThread,
}: {
  data: AppState;
  date: string;
  onBack: () => void;
  onOpenThread: (id: string) => void;
}) {
  const detail = getJournalDayDetail(data, date);
  const hasDumps = detail.dumps.length > 0;
  const hasActivity = detail.threadActivity.length > 0;
  const hasTasks = detail.taskActivity.length > 0;
  const threadById = new Map(data.threads.map((thread) => [thread.id, thread]));

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
          <Feather size={13} /> Dumps & threads
        </div>
        {!hasDumps ? (
          <p className="rounded-[10px] border border-line bg-surface px-4 py-3 text-xs text-soft">
            No dumps this day. Thread writing below may still have happened.
          </p>
        ) : (
          <div className="grid gap-3">
            {detail.dumps.map((dump) => {
              const linked = dump.threadIds
                .map((id) => threadById.get(id))
                .filter((thread): thread is NonNullable<typeof thread> => Boolean(thread));
              return (
                <article key={dump.id} className="rounded-[10px] border border-line bg-surface px-4 py-4">
                  <time className="text-[10px] tracking-wide text-soft">{dateTimeText(dump.createdAt)}</time>
                  {dump.content.trim() ? (
                    <p className="mt-2 mb-0 whitespace-pre-wrap text-[13px] leading-relaxed text-ink">{dump.content}</p>
                  ) : null}
                  {linked.length > 0 && (
                    <ol className="mt-3 list-none border-t border-line pt-2">
                      {linked.map((thread, index) => (
                        <li key={thread.id} className="flex items-center gap-2 py-1.5 text-[13px] text-ink">
                          <span className="w-5 shrink-0 font-display text-[11px] text-soft">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <span className="min-w-0 flex-1 font-medium">{thread.title || 'Untitled'}</span>
                          <button
                            type="button"
                            onClick={() => onOpenThread(thread.id)}
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
          On threads that day
        </div>
        {!hasActivity ? (
          <p className="rounded-[10px] border border-line bg-surface px-4 py-3 text-xs text-soft">
            No thread writing this day.
          </p>
        ) : (
          <div className="grid gap-2">
            {detail.threadActivity.map(({ thread, event }) => (
              <article
                key={event.id}
                className="rounded-lg border border-line bg-surface px-4 py-3.5"
              >
                <small className="flex flex-wrap items-center gap-2 text-[10px] tracking-[0.8px] text-soft uppercase">
                  <time>{dateTimeText(event.createdAt || `${event.date}T12:00:00`)}</time>
                  <KindChip tone={toneFromEventKind(event.kind)} />
                  <span>{thread.title}</span>
                </small>
                <p className="mt-2 mb-2 whitespace-pre-wrap text-[13px] leading-relaxed text-ink">{event.content}</p>
                <button
                  type="button"
                  onClick={() => onOpenThread(thread.id)}
                  className="inline-flex cursor-pointer items-center gap-1 border-0 bg-transparent p-0 text-[11px] text-accent hover:text-ink"
                >
                  Open thread <ArrowRight size={12} />
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
                {item.threadId ? (
                  <button
                    type="button"
                    onClick={() => onOpenThread(item.threadId!)}
                    className="inline-flex shrink-0 cursor-pointer items-center gap-0.5 border-0 bg-transparent p-0 text-[10px] text-accent hover:text-ink"
                  >
                    {item.threadTitle || 'Thread'} <ArrowRight size={12} />
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
