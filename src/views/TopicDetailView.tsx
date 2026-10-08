import { useEffect, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { KindChip, kindDotClass, toneFromEventKind } from '../components/KindChip';
import { TaskRow } from '../components/TaskRow';
import { ago, dateTimeText } from '../lib/dates';
import { fieldClass, primaryBtnClass, TOPIC_STATUS_CHIP } from '../lib/ui';
import { draftKey, readDraft, writeDraft } from '../storage/storage';
import type { Task, TaskStatus, Topic, TopicEventKind, TopicStatus } from '../types';

export function TopicDetailView({
  topic,
  tasks,
  setTaskStatus,
  addTask,
  addNote,
  setStatus,
  onBack,
  onRevisit,
}: {
  topic: Topic;
  tasks: Task[];
  setTaskStatus: (id: string, status: TaskStatus) => void;
  addTask: (title: string, topicId?: string) => void;
  addNote: (id: string, content: string, kind?: Extract<TopicEventKind, 'thinking' | 'decision'>) => void;
  setStatus: (status: TopicStatus) => void;
  onBack: () => void;
  onRevisit: () => void;
}) {
  const noteDraftKey = draftKey(topic.id, 'thinking');
  const decisionDraftKey = draftKey(topic.id, 'decision');
  const [note, setNote] = useState(() => readDraft(noteDraftKey));
  const [decision, setDecision] = useState(() => readDraft(decisionDraftKey));
  const [task, setTask] = useState('');
  const [draftSaved, setDraftSaved] = useState(true);
  const [showSettled, setShowSettled] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDraftSaved(writeDraft(noteDraftKey, note) && writeDraft(decisionDraftKey, decision)),
      180,
    );
    return () => window.clearTimeout(timer);
  }, [decision, decisionDraftKey, note, noteDraftKey]);

  const open = tasks.filter((item) => item.status === 'open');
  const done = tasks.filter((item) => item.status === 'done');
  const dropped = tasks.filter((item) => item.status === 'dropped');

  return (
    <div className="max-w-[790px] rounded-[11px] border border-line bg-surface px-7 py-6 max-[620px]:px-4">
      <button
        type="button"
        onClick={onBack}
        className="mb-6 flex cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 text-[11px] text-soft hover:text-ink"
      >
        <ArrowLeft size={14} /> Back
      </button>

      <div className="text-[10px] font-bold tracking-[1.5px] text-accent uppercase">
        A topic you've been carrying
      </div>
      <h1 className="mt-2 mb-2.5 font-display text-[31px] font-medium tracking-[-1px] text-ink max-[620px]:text-[25px]">
        {topic.title}
      </h1>
      <div className="mb-1 flex flex-wrap items-center gap-2.5 text-[10px] text-soft">
        <span className={`rounded-full px-2 py-1 text-[9px] tracking-[0.8px] uppercase ${TOPIC_STATUS_CHIP[topic.status]}`}>
          {topic.status}
        </span>
        <span>Started {dateTimeText(topic.createdAt)}</span>
        <span>· Last on your mind {ago(topic.updatedAt)}</span>
      </div>

      {/* Compose */}
      <section className="mt-5 border-t border-line pt-5">
        <form
          className="mb-6"
          onSubmit={(event) => {
            event.preventDefault();
            if (note.trim()) {
              addNote(topic.id, note.trim());
              setNote('');
            }
          }}
        >
          <label className="mb-2 flex items-center gap-2 text-[11px] text-muted">
            <KindChip tone="note" />
            <span className="sr-only">Note</span>
          </label>
          <textarea
            className={`mb-2 min-h-[92px] resize-y ${fieldClass}`}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Whatever's on your mind about this… No structure needed."
            aria-label="Write a note about this topic"
          />
          <span className={`mb-2 block text-[10px] ${draftSaved ? 'text-soft' : 'text-[#d4a18e]'}`}>
            {draftSaved
              ? 'Your draft stays on this device until you save it.'
              : 'Could not save the draft locally—keep this page open.'}
          </span>
          <div className="flex justify-end">
            <button className={primaryBtnClass} type="submit">
              Save note <ArrowRight size={14} />
            </button>
          </div>
        </form>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (decision.trim()) {
              addNote(topic.id, decision.trim(), 'decision');
              setDecision('');
            }
          }}
        >
          <label className="mb-2 flex items-center gap-2 text-[11px] text-muted">
            <KindChip tone="decision" />
            <span className="sr-only">Decision</span>
          </label>
          <textarea
            className={`mb-2 min-h-[72px] resize-y ${fieldClass}`}
            value={decision}
            onChange={(event) => setDecision(event.target.value)}
            placeholder="I decided…"
            aria-label="Record a decision"
          />
          <div className="flex justify-end">
            <button className={primaryBtnClass} type="submit">
              Keep this decision <ArrowRight size={14} />
            </button>
          </div>
        </form>
      </section>

      {/* Actions — open only; settled collapse under add */}
      <section className="mt-5 border-t border-line pt-5">
        <div className="mb-3 text-[10px] font-bold tracking-[1.5px] text-soft uppercase">
          Actions · {open.length} open
        </div>
        {open.length ? (
          <div className="mb-3 grid gap-2">
            {open.map((item) => (
              <TaskRow key={item.id} task={item} onChange={(status) => setTaskStatus(item.id, status)} />
            ))}
          </div>
        ) : (
          <p className="mb-3 text-xs leading-relaxed text-soft">No open actions yet.</p>
        )}
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (task.trim()) {
              addTask(task, topic.id);
              setTask('');
            }
          }}
        >
          <label className="mb-2 flex items-center gap-2 text-[11px] text-muted">
            <KindChip tone="task">Action</KindChip>
          </label>
          <input
            value={task}
            onChange={(event) => setTask(event.target.value)}
            placeholder="Add an action, if there is one…"
            aria-label="Add an action for this topic"
            className={`mb-2 ${fieldClass} py-2.5`}
          />
          <div className="flex justify-end">
            <button className={primaryBtnClass} type="submit">
              Add action <ArrowRight size={14} />
            </button>
          </div>
        </form>
        {(done.length > 0 || dropped.length > 0) && (
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setShowSettled((open) => !open)}
              className="cursor-pointer border-0 bg-transparent p-0 text-[11px] text-soft hover:text-ink"
            >
              {showSettled ? 'Hide' : 'Show'} settled
              {done.length ? ` · ${done.length} done` : ''}
              {dropped.length ? ` · ${dropped.length} dropped` : ''}
            </button>
            {showSettled && (
              <div className="mt-2 grid gap-2">
                {[...done, ...dropped].map((item) => (
                  <TaskRow key={item.id} task={item} onChange={(status) => setTaskStatus(item.id, status)} />
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Timeline */}
      <section className="mt-5 border-t border-line pt-5">
        <div className="mb-3 text-[10px] font-bold tracking-[1.5px] text-soft uppercase">
          Timeline · {topic.events.length}
        </div>
        {topic.events.length ? (
          <div>
            {[...topic.events].reverse().map((item) => {
              const tone = toneFromEventKind(item.kind);
              const isWriting = item.kind === 'thinking' || item.kind === 'decision';
              return (
                <article
                  key={item.id}
                  className={`relative ml-1 border-l border-edge pb-4 pl-4 before:absolute before:top-1.5 before:-left-1 before:h-1.5 before:w-1.5 before:rounded-full before:content-[''] ${kindDotClass(tone)}`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <KindChip tone={tone} />
                    <time className="text-[10px] text-soft">
                      {dateTimeText(item.createdAt || `${item.date}T12:00:00`)}
                    </time>
                  </div>
                  <p
                    className={`mt-1.5 mb-0 whitespace-pre-wrap text-[13px] leading-relaxed ${
                      isWriting ? 'text-muted' : 'text-soft'
                    }`}
                  >
                    {item.content}
                  </p>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="text-xs leading-relaxed text-soft">Nothing yet. Start above when you're ready.</p>
        )}
      </section>

      {/* Status */}
      <section className="mt-5 border-t border-line pt-5">
        <div className="mb-3 text-[10px] font-bold tracking-[1.5px] text-soft uppercase">Where this topic is</div>
        <div className="flex flex-wrap gap-1.5">
          {topic.status !== 'active' && (
            <OutlineButton onClick={() => setStatus('active')}>Bring back to active</OutlineButton>
          )}
          {topic.status !== 'later' && (
            <OutlineButton onClick={() => setStatus('later')}>Set aside for later</OutlineButton>
          )}
          {topic.status !== 'resolved' && (
            <OutlineButton onClick={() => setStatus('resolved')}>Mark resolved</OutlineButton>
          )}
          <button type="button" onClick={onRevisit} className={primaryBtnClass}>
            Bring into today’s journal <ArrowRight size={14} />
          </button>
          {topic.status !== 'dropped' && (
            <OutlineButton danger onClick={() => setStatus('dropped')}>
              Let this go
            </OutlineButton>
          )}
        </div>
      </section>
    </div>
  );
}

function OutlineButton({
  children,
  onClick,
  danger,
}: {
  children: ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-line bg-[#191a20] px-2.5 py-2 text-[11px] hover:border-edge',
        danger ? 'text-[#bf9587]' : 'text-ink',
      ].join(' ')}
    >
      {children}
    </button>
  );
}
