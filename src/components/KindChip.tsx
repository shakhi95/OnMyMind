import type { SearchResult, ThreadEventKind } from '../types';

/** Quiet kind tones — distinguish without painting the UI. */
export type KindTone =
  | 'note'
  | 'decision'
  | 'task'
  | 'task_done'
  | 'task_dropped'
  | 'task_reopened'
  | 'status'
  | 'dump'
  | 'thread'
  | 'journal';

const TONE_CLASS: Record<KindTone, string> = {
  note: 'border-[#2e3038] bg-[#1a1b20] text-[#9a9caa]',
  decision: 'border-[#3a3428] bg-[#242018] text-[#c2b49b]',
  task: 'border-[#2e3140] bg-[#1c1e28] text-[#a8acc4]',
  task_done: 'border-[#2c342e] bg-[#1a211c] text-[#9aaf9e]',
  task_dropped: 'border-[#3a2e2a] bg-[#231c1a] text-[#bf9587]',
  task_reopened: 'border-[#2e3140] bg-[#1c1e28] text-[#a8acc4]',
  status: 'border-[#3a3224] bg-[#2a2418] text-[#d0b184]',
  dump: 'border-[#2c2e34] bg-[#18191e] text-[#8e909c]',
  thread: 'border-[#2e3140] bg-[#1c1e28] text-accent',
  journal: 'border-[#2c2e34] bg-[#18191e] text-soft',
};

const DOT_CLASS: Record<KindTone, string> = {
  note: 'before:bg-[#7a7c8a]',
  decision: 'before:bg-[#c2b49b]',
  task: 'before:bg-[#a8acc4]',
  task_done: 'before:bg-[#9aaf9e]',
  task_dropped: 'before:bg-[#bf9587]',
  task_reopened: 'before:bg-[#a8acc4]',
  status: 'before:bg-[#d0b184]',
  dump: 'before:bg-[#8e909c]',
  thread: 'before:bg-accent',
  journal: 'before:bg-soft',
};

const DEFAULT_LABEL: Record<KindTone, string> = {
  note: 'Note',
  decision: 'Decision',
  task: 'Task',
  task_done: 'Done',
  task_dropped: 'Dropped',
  task_reopened: 'Reopened',
  status: 'Status',
  dump: 'Dump',
  thread: 'Thread',
  journal: 'Journal',
};

export function toneFromEventKind(kind: ThreadEventKind): KindTone {
  switch (kind) {
    case 'thinking':
      return 'note';
    case 'decision':
      return 'decision';
    case 'task_added':
      return 'task';
    case 'task_done':
      return 'task_done';
    case 'task_dropped':
      return 'task_dropped';
    case 'task_reopened':
      return 'task_reopened';
    case 'status':
      return 'status';
    case 'revisited':
    case 'linked':
      return 'journal';
    case 'started':
    default:
      return 'thread';
  }
}

export function toneFromSearchKind(kind: SearchResult['kind']): KindTone {
  if (kind === 'note') return 'note';
  if (kind === 'decision') return 'decision';
  if (kind === 'task') return 'task';
  if (kind === 'dump') return 'dump';
  return 'thread';
}

export function toneFromTaskLabel(label: string): KindTone {
  const key = label.toLowerCase();
  if (key === 'done') return 'task_done';
  if (key === 'dropped') return 'task_dropped';
  if (key === 'reopened') return 'task_reopened';
  return 'task';
}

export function KindChip({
  tone,
  children,
}: {
  tone: KindTone;
  children?: string;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[9px] font-semibold tracking-[0.7px] uppercase border ${TONE_CLASS[tone]}`}
    >
      {children ?? DEFAULT_LABEL[tone]}
    </span>
  );
}

export function kindDotClass(tone: KindTone) {
  return DOT_CLASS[tone];
}
